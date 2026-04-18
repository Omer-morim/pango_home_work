
// Login page (`/login`) — all locators in one place.
// Prefer accessible selectors; keep `#id` fallbacks when ARIA labels are weak.

export const loginLocators = {
  class_and_id: {
    username: '.mb-3 #username',
    password: '.mb-3 #password',
  },
// Submit: production UI may be Hebrew or English; regex matches both. 
  submit: { name: /כניסה|login|sign in/i },
  forgotLink: { name: /אפס|reset|forgot/i },
} as const;
