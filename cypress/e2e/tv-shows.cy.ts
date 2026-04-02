describe("TV Shows page", () => {
  beforeEach(() => {
    cy.mockSearch({ tvShows: "tv-shows.json" });
    cy.visit("/tv-shows");
  });

  it("lands on /tv-shows and renders the layout", () => {
    cy.url().should("include", "/tv-shows");
    cy.get("main").should("exist");
  });

  it("renders a show card from fixture data", () => {
    cy.contains("Breaking Bad").should("be.visible");
  });

  it("shows the add-show button", () => {
    cy.contains("button", "Nova Série").should("be.visible");
  });

  it("opens the create drawer when add-show is clicked", () => {
    cy.contains("button", "Nova Série").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains('[role="dialog"]', "Nova série").should("be.visible");
  });
});
