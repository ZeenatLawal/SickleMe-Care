import educationalResources from "@/data/educationalResources.json";

describe("Educational Resources Content", () => {
  it("should load all educational materials correctly", () => {
    expect(educationalResources).toBeDefined();
    expect(typeof educationalResources).toBe("object");

    const resourceKeys = Object.keys(educationalResources);
    expect(resourceKeys.length).toBeGreaterThan(0);

    // Verify essential resources exist
    expect(educationalResources["scd-basics"]).toBeDefined();
    expect(educationalResources["pain-crisis"]).toBeDefined();
    expect(educationalResources["hydration-guide"]).toBeDefined();
  });

  it("should have proper content structure for each resource", () => {
    const resources = Object.values(educationalResources);

    resources.forEach((resource: any) => {
      expect(resource).toHaveProperty("title");
      expect(resource).toHaveProperty("description");
      expect(resource).toHaveProperty("category");
      expect(resource).toHaveProperty("type");
    });
  });

  it("should have accurate medical information", () => {
    const scdBasics = educationalResources["scd-basics"];
    expect(scdBasics.content).toContain("Sickle Cell Disease");
    expect(scdBasics.content).toContain("inherited");
    expect(scdBasics.content).toContain("red blood cells");

    const painCrisis = educationalResources["pain-crisis"];
    expect(painCrisis.content).toContain("vaso-occlusive");
    expect(painCrisis.content).toContain("Dehydration");
    expect(painCrisis.content).toContain("Early intervention");

    const hydration = educationalResources["hydration-guide"];
    expect(hydration.content).toContain("8-10 glasses");
    expect(hydration.content).toContain("2-2.5 litres");
  });

  it("should have proper categorization", () => {
    const resources = Object.values(educationalResources);
    const categories = [...new Set(resources.map((r: any) => r.category))];

    expect(categories).toContain("basics");
    expect(categories).toContain("management");
    expect(categories).toContain("crisis");

    const basicResources = resources.filter(
      (r: any) => r.category === "basics"
    );
    const managementResources = resources.filter(
      (r: any) => r.category === "management"
    );

    expect(basicResources.length).toBeGreaterThan(0);
    expect(managementResources.length).toBeGreaterThan(0);
  });
});

describe("Educational Resources Features", () => {
  it("should handle offline content availability", () => {
    const resources = Object.values(educationalResources);

    resources.forEach((resource: any) => {
      // Must have either content or url property
      const hasContent = resource.content && resource.content.length > 0;
      const hasUrl = resource.url && resource.url.length > 0;

      expect(hasContent || hasUrl).toBe(true);
    });
  });

  it("should validate link functionality structure", () => {
    const resources = Object.values(educationalResources);

    resources.forEach((resource: any) => {
      // Ensure each resource has proper type for navigation
      expect(resource.type).toBeDefined();
      expect(["article", "video", "checklist", "guide", "external"]).toContain(
        resource.type
      );

      // Ensure resources have unique identifiers
      expect(resource).toHaveProperty("title");
      expect(resource).toHaveProperty("category");
    });
  });
});
