export {};

declare global {
  namespace Cypress {
    interface Chainable {
      mockSearch(fixtures: Record<string, string>): void;
      mockReadAsset(assetType: string, body: object): void;
    }
  }
}

Cypress.Commands.add("mockSearch", (fixtures: Record<string, string>) => {
  cy.intercept("POST", "/api/query/search", (req) => {
    const assetType = req.body?.query?.selector?.["@assetType"] as
      | string
      | undefined;
    if (assetType && fixtures[assetType]) {
      req.reply({ fixture: fixtures[assetType] });
    } else {
      req.continue();
    }
  });
});

Cypress.Commands.add("mockReadAsset", (assetType: string, body: object) => {
  cy.intercept("POST", "/api/query/readAsset", (req) => {
    if (req.body?.key?.["@assetType"] === assetType) {
      req.reply(body);
    } else {
      req.continue();
    }
  });
});
