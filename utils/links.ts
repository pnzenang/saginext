type NavLink = {
  href: string
  label: string
}

export const links: NavLink[] = [
  { href: '/', label: 'home' },
  { href: '/internal-rules', label: 'internal rules at glance' },
  { href: '/instructions', label: 'navigation instructions' },
  { href: '/add-member', label: 'add member' },
  { href: '/all-members', label: 'all members' },
  { href: '/removed-members', label: 'removed members' },
  { href: '/deceased-members', label: 'deceased members' },
  { href: '/monthly-contributions', label: 'monthly contributions' },
  { href: '/admin/all-members-admin', label: 'all members admin' },
  { href: '/admin/all-users-admin', label: 'all users' },
  { href: '/profile', label: 'profile' },
]
