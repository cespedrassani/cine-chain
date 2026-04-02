describe("TV Show Detail page", () => {
  beforeEach(() => {
    cy.mockSearch({
      tvShows: "tv-shows.json",
      seasons: "seasons.json",
      episodes: "episodes.json",
    });
    cy.visit("/tv-shows/tvShows:breaking-bad");
  });

  it("renders the show title in the header", () => {
    cy.contains("Breaking Bad").should("be.visible");
  });

  it("renders the recommended age badge", () => {
    cy.contains("Idade +18").should("be.visible");
  });

  it("renders the season row from fixture data", () => {
    cy.contains("Temporada 1").should("be.visible");
    cy.contains("2008").should("be.visible");
  });

  it("shows the nova-temporada button", () => {
    cy.contains("button", "Nova Temporada").should("be.visible");
  });

  it("opens the create season drawer", () => {
    cy.contains("button", "Nova Temporada").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains('[role="dialog"]', "Nova Temporada").should("be.visible");
  });

  it("navigates to season detail when season row is clicked", () => {
    cy.contains("Temporada 1").click();
    cy.url().should("include", "/seasons/");
  });
});
