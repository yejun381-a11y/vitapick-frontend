import { API_BASE_URL } from "./app-config";
import axios from "axios";

export const apiCall = axios.create(
    {baseURL: API_BASE_URL}
);
export const refreshapi = axios.create(
    {baseURL: API_BASE_URL,
    withCredentials: true, //Cookie 반드시 필요
    }
);
const getRefresh = async()=>{
    const result = await refreshapi.get("/api/v1/getrefresh");
    return result.data;
}

//=> 요청 인터셉터 (request interceptor)
//-> API 요청 보내기전 토큰이 존재할 경우, Header에 Authorization: Bearer xxx 자동추가.
 //-> 단 getrefresh 요청은 accessToken 필요없고 Cookie 포함해야하므로 별도의 인스턴스(refreshapi) 로 처리함
apiCall.interceptors.request.use((config)=>{
    const accessToken = sessionStorage.getItem("accessToken");
    console.log(`** url.interceptors.request, accessToken=${accessToken}`);
    if(accessToken){config.headers.Authorization = `Bearer ${accessToken}`}
    return config;
})

let isRefreshing = false; //현재 요청 중인지 확인용
let requestQueue = []; //요청이 겹칠 때 대기 큐

//=> 응답 인터셉터
//-> 성공이면 그대로 넘기고, 에러이면 async 함수 호출. 401 이면 accessToken 만료, refreshToken으로 재발급 요청(다른 에러는 에러처리)
apiCall.interceptors.response.use(
    (response)=>response.data, //성공 응답이면 그대로 반환
    async(error)=>{
        console.log("요청 URL:", error.config?.url);
        console.log("요청 method:", error.config?.method);
        console.log("응답 status:", error.response?.status);

        const originalRequest = error.config; //=> error.config: 에러난 객체의 내부설정 정보(그러므로 커스텀속성 "_retry" 추가 가능)
        //=> error.config는 첫 요청의 config와 내용이 동일함. 그러므로 retry 속성추가, headers의 authorization에 새토큰만 넣어서 다시 요청가능
        if(error.response?.status == 401 && !originalRequest._retry){
            console.log(`401발생: retry를 true로 변경.`);
            originalRequest._retry = true;
            if(!isRefreshing){
                //-> 만약 리프레시 요청중인 상태면 else에서 큐에 담아 대기
                isRefreshing = true;
                console.log(`isRefreshing을 true로 변경하고 getRefresh를 실행합니다.`);
                try{
                    const response = await getRefresh();
                    const newAccessToken = response.accessToken;
                    console.log(`newAccessToken= ${newAccessToken}`);
                    sessionStorage.setItem("accessToken", newAccessToken);
                    originalRequest.headers["Authorization"]=`Bearer ${newAccessToken}`;
                    //모든 대기중 요청에 새 토큰 전달
                    requestQueue.forEach((cb)=>cb(newAccessToken));
                    requestQueue = [];
                    //-> 원래 실패했던 요청에 토큰 갱신 후 다시 요청
                    return apiCall(originalRequest);
                }catch(error){
                    console.log(`refresh 발행중 오류 error.response.status = ${error.response.status}`);
                    requestQueue = [];
                    alert("세션이 만료되었습니다. 다시 로그인 하세요.");
                    sessionStorage.clear();
                    window.location.replace("/api/v1/auth/login");
                    //=> refreshToken 오류 또는 만료 인 경우 큐초기화, 세션스토리지 초기화, 로그인화면 이동
                    return new Promise(()=>{});
                    //   Promise를 영원히 pending 상태로 만들어 에러 전파를 막는 코드.
                }finally{
                    isRefreshing = false;
                }//try
            }else{//-> 만약 리프레시 요청중인 상태면 "refresh 끝날 때까지 기다려야 함" 그래서 Promise를 만들고 요청 대기 큐에 담아 대기함, 새토큰이 오면 header에 세팅하고 반환하여 실행하게됨 
                console.log(`isRefreshing이 true입니다. 요청을 대기 큐로 보냅니다.`);
                return new Promise((resolve)=>{
                    requestQueue.push((newAccessToken)=>{
                        originalRequest.headers["Authorization"]=`Bearer ${newAccessToken}`;
                        resolve(apiCall(originalRequest));
                    });
                });
            }//else
        }//(error.response?.status == 401)
        return Promise.reject(error); //최종반환
    }//async (error)=>{
); //api.interceptors.response.use(..

// 2. access토큰 저장
export function saveToken(token) {
    sessionStorage.setItem("accessToken", token);
}

// 3. access토큰 꺼내기
export function getToken() {
    return sessionStorage.getItem("accessToken");
}

// 4. 토큰 삭제(로그아웃)
export function removeToken() {
    sessionStorage.removeItem("accessToken");
}

// 5. localStorage 데이터 꺼내기
export function getLocalData(key) {
    const data = localStorage.getItem(key);
    if (data !== null) return JSON.parse(data);
    else return null;
}

// 6. sessionStorage 데이터 꺼내기
export function getSessionData(key) {
    const data = sessionStorage.getItem(key);
    if (data !== null) return JSON.parse(data);
    else return null;
}