import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
} from 'lucide-react'
import styles from './BottomNav.module.css'

const items = [
  { to: '/', icon: <LayoutDashboard size={22} />, label: 'Dashboard', end: true },
  { to: '/jobs', icon: <Briefcase size={22} />, label: 'Jobs' },
  { to: '/applications', icon: <ClipboardList size={22} />, label: 'Applications' },
  { to: '/resumes', icon: <FileText size={22} />, label: 'Resumes' },
  { to: '/interviews', icon: <GraduationCap size={22} />, label: 'Prep' },
]

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
