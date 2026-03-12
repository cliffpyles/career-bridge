import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Bell,
  ClipboardList,
  FileText,
  Library,
  GraduationCap,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useSidebar } from '../../contexts/SidebarContext'
import styles from './Sidebar.module.css'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ],
  },
  {
    label: 'Search',
    items: [
      { to: '/jobs', icon: <Briefcase size={20} />, label: 'Job Board' },
      { to: '/saved-jobs', icon: <Bookmark size={20} />, label: 'Saved Jobs' },
      { to: '/alerts', icon: <Bell size={20} />, label: 'Alerts' },
    ],
  },
  {
    label: 'Apply',
    items: [
      { to: '/applications', icon: <ClipboardList size={20} />, label: 'Applications' },
      { to: '/resumes', icon: <FileText size={20} />, label: 'Resumes' },
      { to: '/experience', icon: <Library size={20} />, label: 'Experience' },
    ],
  },
  {
    label: 'Prepare',
    items: [
      { to: '/interviews', icon: <GraduationCap size={20} />, label: 'Interviews' },
    ],
  },
]

const bottomItems: NavItem[] = [
  { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  { to: '/profile', icon: <User size={20} />, label: 'Profile' },
]

export function Sidebar() {
  const { collapsed, toggle } = useSidebar()
  const navigate = useNavigate()

  return (
    <nav
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main navigation"
      data-testid="sidebar"
    >
      {/* Wordmark */}
      <div className={styles.wordmark} onClick={() => navigate('/')}>
        {collapsed ? (
          <span className={styles.wordmarkIcon} aria-label="Career Bridge">◆</span>
        ) : (
          <span className={styles.wordmarkText}>Career Bridge</span>
        )}
      </div>

      <div className={styles.divider} />

      {/* Nav sections */}
      <div className={styles.navSections}>
        {navSections.map((section, i) => (
          <div key={i} className={styles.section}>
            {!collapsed && section.label && (
              <span className={styles.sectionLabel}>{section.label}</span>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom items */}
      <div className={styles.bottom}>
        <div className={styles.divider} />
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}

        {/* Collapse toggle */}
        <button
          className={styles.collapseToggle}
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span aria-hidden="true">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && <span className={styles.navLabel}>Collapse</span>}
        </button>
      </div>
    </nav>
  )
}
