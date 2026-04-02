describe("Season Detail page", () => {
  beforeEach(() => {
    cy.mockReadAsset("seasons", {
      "@assetType": "seasons",
      "@key": "seasons:breaking-bad-s1",
      number: 1,
      year: 2008,
      tvShow: {
        "@assetType": "tvShows",
        "@key": "tvShows:breaking-bad",
      },
    });
    cy.mockSearch({
      tvShows: "tv-shows.json",
      episodes: "episodes.json",
    });
    cy.visit("/seasons/seasons:breaking-bad-s1");
  });

  it("renders the season heading", () => {
    cy.contains("Temporada 1").should("be.visible");
    cy.contains("2008").should("be.visible");
  });

  it("renders the show title as a breadcrumb link", () => {
    cy.contains("Breaking Bad").should("be.visible");
  });

  it("renders the episode row from fixture data", () => {
    cy.contains("Pilot").should("be.visible");
  });

  it("shows the novo-episodio button", () => {
    cy.contains("button", "Novo Episódio").should("be.visible");
  });

  it("opens the create episode drawer", () => {
    cy.contains("button", "Novo Episódio").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains('[role="dialog"]', "Novo Episódio").should("be.visible");
  });

  it("navigates back when voltar is clicked", () => {
    cy.contains("button", "Voltar").click();
    cy.url().should("include", "/tv-shows");
  });
});
