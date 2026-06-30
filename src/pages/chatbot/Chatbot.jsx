import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../service/apiService';
import './Chatbot.css';

const Chatbot = ({ onClose, userInfo }) => {

    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        { senderCd: 'AI', msgTxt: '안녕하세요! 💊 VitaPick AI입니다.\n증상이나 건강 고민을 말씀해 주시면 맞춤 영양제를 추천해 드릴게요!' }
    ]);

    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    // 현재 상담방 ID
    const [chatId, setChatId] = useState(null);

    const findPrdImages = async (msgTxt) => {
        const json = JSON.parse(msgTxt);

        // 추천 상품이 없으면 빈 배열 반환
        if (json.products.length === 0) {
            return [];
        }

        const prdIds = json.products.map(item => item.prd_id); // 상품ID 추출

        const results = []; // 상품ID마다 상세 정보 조회하여 이미지 URL 포함된 객체 생성
        
        // 상품ID마다 상세 정보 조회
        for (const id of prdIds) {
            const data = await apiCall.get(`/api/v1/product/detail/${id}`);
            if (data !== null) {
                results.push(data);
            }
        }

        return results; // 이미지 URL이 포함된 상품 정보 배열 반환
    };

    const handleSend = async () => { // 전송 버튼 눌렀을 때

        if (!inputText.trim()) return;

        const sendText = inputText;

        // 사용자가 입력한 메시지를 대화창에 먼저 추가
        setMessages(prev => [...prev, { senderCd: 'USER', msgTxt: sendText }]);
        setInputText('');
        setLoading(true);
        
        // 챗봇 API에 메시지 전송
        try {
            const result = await apiCall.post(
                '/api/v1/chatbot/message',
                {
                    chatId: chatId,
                    msgTxt: sendText
                }
            );

            // 백엔드 응답에서 chatId 저장
            if (result.chatId) {
                setChatId(result.chatId);
            }

            const matchedPrds = await findPrdImages(result.msgTxt); // 응답 메시지에서 상품ID 찾아서 이미지 URL 포함된 상품 정보 배열 가져오기

            const json = JSON.parse(result.msgTxt); // 응답 메시지 JSON 파싱

            let displayText = ''; // 최종적으로 보여줄 텍스트

            displayText += json.reason; // 챗봇이 답변한 조합 이유

            // 조합 이유와 주의사항이 있을 때만 텍스트에 추가
            if (json.comboReason !== '') {
                displayText += '\n\n추가 추천 이유: ' + json.comboReason;
            }

            // 주의사항이 있을 때만 텍스트에 추가
            if (json.caution !== '') {
                displayText += '\n\n주의사항: ' + json.caution;
            }

            setMessages(prev => [...prev, { // 챗봇 답변 메시지에 상품 정보 포함하여 추가
                senderCd: 'AI',
                msgTxt: displayText,
                products: matchedPrds
            }]);

            // 스크롤 맨 아래로 내리기
            setTimeout(() => {
                const box = document.querySelector('.chatPopup_messages');
                box.scrollTop = box.scrollHeight;
            }, 100);

        } catch (err) {
            console.error('챗봇 요청 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);

            setMessages(prev => [
                ...prev,
                { senderCd: 'AI', msgTxt: '오류가 발생했습니다. 다시 시도해 주세요.' }
            ]);

        } finally {
            setLoading(false);
        }
    };

    // X 버튼 눌렀을 때 현재 상담방 종료
    const handleClose = async () => {
        try {
            if (chatId) {
                await apiCall.patch(`/api/v1/chatbot/rooms/${chatId}/close`);
            }

            setChatId(null);
            onClose();

        } catch (err) {
            console.error('챗봇방 닫기 오류:', err);
            setChatId(null);
            onClose();
        }
    };

    const goProductDetail = (prdId) => {
        navigate(`/products/detail/${prdId}`);
    };

    const handleKeyDown = (e) => { // Enter 키 눌렀을 때 메시지 전송
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className='chatPopup_container'>

            <div className='chatPopup_header'>
                <img src='/images/VitaPick_ChatBot_Logo.png' alt='챗봇' className='chatPopup_logo' />
                <h3>VitaPick AI 챗봇</h3>
                <button className='chatPopup_close' onClick={handleClose}>✕</button>
            </div>

            <div className='chatPopup_messages'>
                {messages.map((msg, idx) => (
                    <div key={idx} className={msg.senderCd === 'USER' ? 'chatPopup_msg_user' : 'chatPopup_msg_ai'}>

                        <div className='chatPopup_bubble'>
                            {msg.msgTxt.replace(/상품ID:\s*\d+\s*\/\s*/g, '')} 
                        </div>

                        {msg.products && msg.products.length > 0 && (
                            <div className='chatPopup_prd_list'>
                                {msg.products.map((prd, pIdx) => (
                                    <div
                                        key={pIdx}
                                        className='chatPopup_prd_card'
                                        onClick={() => goProductDetail(prd.prdId)}
                                    >
                                        <img src={prd.thumbImgUrl} alt={prd.prdNm} />
                                        <p>{prd.prdNm}</p>
                                        <strong>{prd.price.toLocaleString()}원</strong>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                ))}

                {loading && (
                    <div className='chatPopup_msg_ai'>
                        <div className='chatPopup_bubble'>
                            답변을 생성 중입니다...
                        </div>
                    </div>
                )}
            </div>

            <div className='chatPopup_input'>
                <textarea
                    className='chatPopup_textarea'
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='증상을 입력하세요 (예: 요즘 너무 피곤해요)'
                    rows={2}
                />
                <button className='chatPopup_btn' onClick={handleSend} disabled={loading}>
                    전송
                </button>
            </div>

        </div>
    );
};

export default Chatbot;