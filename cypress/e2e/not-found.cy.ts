describe("Not Found page", () => {
  it("renders 404 heading for unknown routes", () => {
    cy.visit("/rota-que-nao-existe");
    cy.contains("404").should("be.visible");
  });

  it("renders the descriptive message", () => {
    cy.visit("/rota-que-nao-existe");
    cy.contains("Página não encontrada").should("be.visible");
  });

  it("navigates to tv-shows when voltar-ao-inicio is clicked", () => {
    cy.visit("/rota-que-nao-existe");
    cy.contains("button", "Voltar ao início").click();
    cy.url().should("include", "/tv-shows");
  });
});
