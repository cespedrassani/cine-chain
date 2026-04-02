describe("Watchlist page", () => {
  beforeEach(() => {
    cy.mockSearch({
      watchlist: "watchlists.json",
      tvShows: "tv-shows.json",
    });
    cy.visit("/watchlist");
  });

  it("renders the section heading", () => {
    cy.contains("Minhas Listas").should("be.visible");
  });

  it("renders a watchlist card from fixture data", () => {
    cy.contains("Minha Lista").should("be.visible");
  });

  it("shows the show count badge", () => {
    cy.contains("1 show").should("be.visible");
  });

  it("expands the card to show linked shows when clicked", () => {
    cy.contains("Minha Lista").click();
    cy.contains("Breaking Bad").should("be.visible");
  });

  it("shows the nova-lista button", () => {
    cy.contains("button", "Nova Lista").should("be.visible");
  });

  it("opens the create watchlist drawer", () => {
    cy.contains("button", "Nova Lista").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains('[role="dialog"]', "Nova lista").should("be.visible");
  });
});
