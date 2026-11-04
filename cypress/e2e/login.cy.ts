// Draai met: npx cypress run --env email=demo@waarbenje.be,password=...
// (de app moet lopen op http://localhost:8081, bv. via `npm run web`)
describe('Login screen', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders the login form', () => {
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="login-button"]').should('exist');
  });

  it('shows an error for empty fields', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Vul alle velden in.').should('be.visible');
  });

  it('switches to the sign-up form', () => {
    cy.get('[data-testid="toggle-mode"]').click();
    cy.get('[data-testid="name-input"]').should('exist');
    cy.contains('Account maken').should('be.visible');
  });

  it('logs in, shows the home page and opens the friends map', () => {
    const email = Cypress.env('email') as string | undefined;
    const password = Cypress.env('password') as string | undefined;
    if (!email || !password) {
      cy.log('Geen testaccount meegegeven: test overgeslagen');
      return;
    }

    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();

    cy.location('pathname').should('eq', '/');
    cy.contains('Jouw groepen').should('be.visible');
    cy.get('[data-testid="group-BENDE1"]').click();
    cy.location('pathname').should('eq', '/map');
    cy.contains('Vrienden').should('be.visible');
    cy.get('[data-testid="friend-Lotte"]').click();
    cy.location('pathname').should('eq', '/friend');
    cy.get('[data-testid="distance"]').should('be.visible');
  });
});
