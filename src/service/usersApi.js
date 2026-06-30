import {apiCall, refreshapi} from "./apiService";

export const UsersApi={
    //로그인
    login: async (loginId, pwd)=>{
        console.log(apiCall);
        const loginData = {
            loginId: loginId,
            pwd: pwd,
        };
        const result = await apiCall.post(`/api/v1/auth/login`, loginData, {withCredentials: true,});
        console.log(`** login, result.data =`)
        return result;
    },

    //로그아웃
    logout: async () => {
        const result = await apiCall.get(`/api/v1/auth/logout`, {withCredentials: true,});
        return result;
    },

    //아이디 찾기
    findId: async (userNm, email)=>{
        const findIdData = {
            userNm: userNm,
            email: email,
        };
        const result = await apiCall.post(`/api/v1/auth/findid`, findIdData)
        return result;
    },

    //비밀번호찾기(인증번호 발급)
    sendOtpCode: async(loginId, userNm, email)=>{
        const findPwdData = {
            loginId: loginId,
            userNm: userNm,
            email: email,
        };
        const result = await apiCall.post(`/api/v1/auth/sendotpcode`, findPwdData)
        return result;
    },
    //비밀번호찾기(비밀번호 재설정)
    resetPwd: async(loginId, inputOtpCode, pwd)=>{
        const resetPwdData = {
            loginId: loginId,
            otpCode: inputOtpCode,
            pwd: pwd,
        };
        const result = await apiCall.post(`/api/v1/auth/resetpwd`, resetPwdData)
        return result;
    },

    //내 회원정보 조회
    getProfile: async()=>{
        const result = await apiCall.get(`/api/v1/info`);
        return result;
    },

    //내 회원정보 수정
    updateProfile: async(updateData) => {
        const result = await apiCall.put(`/api/v1/update`, updateData);
        return result;
    },

    //Server Data 요청
    //=> userdetail, memberlist, boardlist 
    getServerData: async (url) => {
        const result = await apiCall.get(url);
        return result;
    },
};

export default UsersApi;