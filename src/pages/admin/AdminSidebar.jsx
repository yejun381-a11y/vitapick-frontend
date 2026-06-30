import { useNavigate } from 'react-router-dom';
import './Admin.css';

function AdminSidebar({ activeTab, onChangeTab }) {
    const navigate = useNavigate();
    const menuItems = [
        { id: 'dashboard', label: '대시보드', mark: 'H', path: '/admin' },
        { id: 'users', label: '회원 관리', mark: 'M', path: '/admin/users' },
        { id: 'prd', label: '상품 관리', mark: 'P', path: '/admin/products' },
        { id: 'ord', label: '주문 관리', mark: 'O', path: '/admin/orders' },
        { id: 'rvw', label: '리뷰 관리', mark: 'R', path: '/admin/reviews' },
        { id: 'cscenter', label: '고객센터 관리', mark: 'C', path: '/admin/cscenter' }
    ];

    const handleClickMenu = (item) => {
        onChangeTab(item.id);
        navigate(item.path);
    };

    return (
        <aside className="adminSidebar">
            <div className="adminBrand">
                <div className="adminBrandIcon">V</div>
                <div>
                    <h2>Vita Pick</h2>
                    <p>Admin Center</p>
                </div>
            </div>

            <nav className="adminMenu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={
                            activeTab === item.id
                                ? 'adminMenuBtn active'
                                : 'adminMenuBtn'
                        }
                        onClick={() => handleClickMenu(item)}
                    >
                        <span className="adminMenuMark">{item.mark}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="adminProfileCard">
                <div className="adminProfileAvatar">VP</div>
                <div>
                    <strong>VitaPick 관리자</strong>
                    <p>admin</p>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
