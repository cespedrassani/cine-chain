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
    cy.contains("1 série").should("be.visible");
  });

  it("expands the card to show linked shows when clicked", () => {
    cy.contains("Minha Lista").click();
    cy.get('[role="dialog"]:not([aria-hidden="true"])')
      .should("be.visible")
      .and("contain.text", "Breaking Bad");
  });

  it("shows the nova-lista button", () => {
    cy.contains("button", "Nova Lista").should("be.visible");
  });

  it("opens the create watchlist drawer", () => {
    cy.contains("button", "Nova Lista").click();
    cy.get('[role="dialog"]:not([aria-hidden="true"])')
      .should("be.visible")
      .and("contain.text", "Nova lista");
  });
});
