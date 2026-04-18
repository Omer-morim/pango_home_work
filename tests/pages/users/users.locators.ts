// Users list (`/users`) + add form (`/users/add`).

export const usersLocators = {
  list: {
    addUserLink: { role: 'link' as const, name: 'Add User' },
    // Row that lists a username in the first column 
    rowForUsername: (username: string) => `tr:has-text("${username}")`,
  },
  addForm: {
// Same class_and_id as login page — only valid on `/users/add` 
    username: '.mb-3 #username',
    password: '.mb-3 #password',
    submit: '#submit',
  },
} as const;
