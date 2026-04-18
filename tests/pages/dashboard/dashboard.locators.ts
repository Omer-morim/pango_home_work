
//  Dashboard (`/`) — parking form + active sessions table + top nav.

export const dashboardLocators = {
// Prefer accessible name from visible English labels 
  fields: {
    carPlate: {
      role: 'textbox' as const,
      name: /car plate/i,
      fallback: '.mb-3 #car_plate',
    },
    slot: {
      role: 'textbox' as const,
      name: /slot/i,
      fallback: '.mb-3 #slot',
    },
    image: '#image',
    startParking: { name: /start parking/i },
  },
  nav: {
    history: { role: 'link' as const, name: 'History' },
    users: { role: 'link' as const, name: 'Users' },
    dashboard: { role: 'link' as const, name: 'Dashboard' },
  },
// End session: label may be Hebrew or English in the homework build 
  endSessionButton: { name: /סיים|סיום|end/i },
  activeTable: {
    body: 'table tbody',
    rowByPlate: (plate: string) => `tr:has-text("${plate}")`,
  },
} as const;
