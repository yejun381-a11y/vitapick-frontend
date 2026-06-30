import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../service/apiService";
import "./MyChatbotList.css";

function MyChatbotList() {
    const [roomList, setRoomList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        callMyChatbotList();
    }, []);

    async function callMyChatbotList() {
        try {
            const data = await apiCall.get("/api/v1/chatbot/rooms");
            setRoomList(data);
        } catch (err) {
            console.error("AI 챗봇 상담 목록 불러오기 오류", err);
        }
    }

    function goDetail(chatId) {
        navigate(`/mypage/mychatbot/${chatId}`);
    }

    async function deleteChatRoom(e, chatId) {
        e.stopPropagation();

        const ok = window.confirm("이 상담 내역을 삭제하시겠습니까?");
        if (!ok) return;

        try {
            await apiCall.delete(`/api/v1/chatbot/rooms/${chatId}`);

            setRoomList(roomList.filter((room) => room.chatId !== chatId));
        } catch (err) {
            console.error("AI 챗봇 상담 삭제 오류", err);
            alert("상담 내역 삭제에 실패했습니다.");
        }
    }

    return (
        <div className="mychat-wrap">
            <h2>AI 챗봇 상담 내역</h2>
            <p>A.I 챗봇과 진행한 상담 내역을 확인할 수 있습니다</p>

            {roomList.length === 0 ? (
                <p className="mychat-empty">상담 내역이 없습니다.</p>
            ) : (
                roomList.map((room) => (
                    <div
                        className="mychat-item"
                        key={room.chatId}
                        onClick={() => goDetail(room.chatId)}
                    >
                        <div>
                            <h3>{room.title}</h3>
                            <p>생성일시: {room.crtAt}</p>
                        </div>

                        <div className="mychat-btns">
                            <button
                                type="button"
                                className="mychat-detail-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goDetail(room.chatId);
                                }}
                            >
                                상세보기
                            </button>

                            <button
                                type="button"
                                className="mychat-delete-btn"
                                onClick={(e) => deleteChatRoom(e, room.chatId)}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyChatbotList;