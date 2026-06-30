import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../service/apiService";
import "./MyWithdraw.css";
import {UsersApi} from "../../../service/usersApi"


function MyWithdraw(){
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setFocus,
        formState:{isSubmitting, errors},
    }=useForm({
        mode: "onBlur",
        reValidateMode: "onBlur",
    });
    const pwdRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/;

    const onSubmit = async(data)=>{
        const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
        if(!confirmed){
            setFocus("pwd");
            return;
        }
        try{
            await apiCall.post("/api/v1/withdraw", {pwd: data.pwd});
            sessionStorage.clear();
            localStorage.clear();
            alert("탈퇴되었습니다.");
            window.location.href = "/"
        }catch(e){
            console.error("회원탈퇴실패", e);
            alert(e.response?.data || "탈퇴 중 오류가 발생했습니다.");
            setFocus("pwd");
        }
    };

    return(
        <div className="mywithdraw-wrap">
            <h2>회원탈퇴</h2>
            <p>비밀번호를 입력하면 탈퇴가 진행됩니다.</p>
            <form className="mywithdraw-form" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="password"
                    placeholder="비밀번호"
                    {...register("pwd",{
                        required: "비밀번호를 입력해주세요",
                        pattern:{
                            value: pwdRegex,
                            message: "영문+숫자 조합 8~20자로 입력해주세요"
                        },
                    })}
                />
                {errors.pwd && <p className="mywithdraw-error">{errors.pwd.message}</p>}
                
                <button className="mywithdraw-btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "처리중..." : "탈퇴하기"}
                </button>
            </form>
        </div>
    );
}
export default MyWithdraw;