import { useNavigate } from 'react-router-dom';

import './HealthInfo.css';

function HealthInfo() {
    const navigate = useNavigate();

    const productMap = {
        '면역력 관리': 13,
        '장 건강': 4,
        '눈 건강': 23,
        '피로 개선': 1,
        '혈행 건강': 20,
        '뼈 건강': 21,
        '피부 건강': 47
    };

    const handleCategoryMove = (category) => {
        navigate(`/products/detail/${productMap[category]}`);
    };

    const topNutrients = [
        {
            name: '오메가3',
            img: '💊',
            desc: '혈행 개선에 도움을 줄 수 있으며, 혈중 중성지방 개선에 도움을 줄 수 있어요.'
        },
        {
            name: '유산균',
            img: '🦠',
            desc: '장 건강에 도움을 주어 원활한 배변 활동과 면역력 증진에 도움을 줘요.'
        },
        {
            name: '마그네슘',
            img: 'Mg',
            desc: '신경과 근육 기능 유지에 필요하며, 에너지 이용과 피로 개선에 도움을 줘요.'
        },
        {
            name: '루테인',
            img: '👁️',
            desc: '황반색소 밀도를 유지하여 눈 건강에 도움을 줄 수 있어요.'
        },
        {
            name: '비타민D',
            img: '☀️',
            desc: '칼슘과 인이 흡수되고 이용되는 데 필요하며, 뼈 건강에 도움을 줘요.'
        }
    ];

    const categories = [
        '면역력 관리',
        '장 건강',
        '눈 건강',
        '피로 개선',
        '혈행 건강',
        '뼈 건강',
        '피부 건강'
    ];

    return (
        <div className="healthPage">

            <div className="healthTop">

                <section className="healthIntro">
                    <h2>건강정보</h2>
                    <p>
                        건강한 라이프를 위한 영양 정보와<br />
                        요즘 주목받는 영양제를 만나보세요!
                    </p>
                </section>

                <section className="healthBanner">
                    <div>
                        <p>내 몸에 딱 맞는 영양 정보,</p>
                        <strong>비타픽이 알려드려요!</strong>
                    </div>

                    <div className="healthBannerIcon">
                        💚
                    </div>
                </section>

            </div>

            <div className="healthContent">

                <aside className="healthCategory">
                    <h3>요즘 뜨는 영양제</h3>

                    {categories.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleCategoryMove(item)}
                        >
                            <span>{item}</span>
                            <span>›</span>
                        </button>
                    ))}
                </aside>

                <main className="healthMain">

                    <section className="healthSection">
                        <h3>요즘 주목받는 영양제</h3>

                        <div className="nutrientGrid">
                            {topNutrients.map(item => (
                                <div className="nutrientCard" key={item.name}>

                                    <div className="nutrientIcon">
                                        {item.img}
                                    </div>

                                    <h4>{item.name}</h4>

                                    <p>{item.desc}</p>

                                </div>
                            ))}
                        </div>
                    </section>

                </main>

            </div>

        </div>
    );
}

export default HealthInfo;