// craft/tracker.ts — CraftLog AI Core Domain

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "planned" | "in_progress" | "completed" | "abandoned";
  materials: MaterialUsage[];
  steps: ProjectStep[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
}

export interface MaterialUsage {
  materialId: string;
  name: string;
  quantityNeeded: number;
  quantityUsed?: number;
  unit: string;
  unitCost: number;
}

export interface ProjectStep {
  order: number;
  title: string;
  description: string;
  completed: boolean;
  notes?: string;
  photoUrl?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  quantityOnHand: number;
  minQuantity: number;
  supplier?: string;
  reorderUrl?: string;
}

export interface CostEntry {
  id: string;
  projectId: string;
  projectName: string;
  category: "material" | "tool" | "shipping" | "other";
  description: string;
  amount: number;
  date: string;
  receipt?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  url?: string;
  steps: string[];
  estimatedTime: string;
  materialsNeeded: string[];
  tags: string[];
}

// --- ProjectTracker ---

export class ProjectTracker {
  private projects: Map<string, Project> = new Map();

  create(data: Omit<Project, "id" | "createdAt" | "updatedAt" | "status">): Project {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  get(id: string): Project | undefined {
    return this.projects.get(id);
  }

  list(filter?: { category?: string; status?: Project["status"] }): Project[] {
    let results = [...this.projects.values()];
    if (filter?.category) results = results.filter((p) => p.category === filter.category);
    if (filter?.status) results = results.filter((p) => p.status === filter.status);
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  update(id: string, patch: Partial<Project>): Project | null {
    const existing = this.projects.get(id);
    if (!existing) return null;
    const updated: Project = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    this.projects.set(id, updated);
    return updated;
  }

  addStep(id: string, step: Omit<ProjectStep, "order" | "completed">): Project | null {
    const project = this.projects.get(id);
    if (!project) return null;
    project.steps.push({ ...step, order: project.steps.length + 1, completed: false });
    project.updatedAt = new Date().toISOString();
    return project;
  }

  completeStep(id: string, stepOrder: number): Project | null {
    const project = this.projects.get(id);
    if (!project) return null;
    const step = project.steps.find((s) => s.order === stepOrder);
    if (step) step.completed = true;
    project.updatedAt = new Date().toISOString();
    return project;
  }

  addPhoto(id: string, photoUrl: string): Project | null {
    const project = this.projects.get(id);
    if (!project) return null;
    project.photos.push(photoUrl);
    project.updatedAt = new Date().toISOString();
    return project;
  }

  delete(id: string): boolean {
    return this.projects.delete(id);
  }

  getProgress(id: string): number {
    const project = this.projects.get(id);
    if (!project || project.steps.length === 0) return 0;
    const completed = project.steps.filter((s) => s.completed).length;
    return Math.round((completed / project.steps.length) * 100);
  }
}

// --- MaterialInventory ---

export class MaterialInventory {
  private materials: Map<string, Material> = new Map();

  add(data: Omit<Material, "id">): Material {
    const material: Material = { ...data, id: crypto.randomUUID() };
    this.materials.set(material.id, material);
    return material;
  }

  get(id: string): Material | undefined {
    return this.materials.get(id);
  }

  list(filter?: { category?: string; lowStock?: boolean }): Material[] {
    let results = [...this.materials.values()];
    if (filter?.category) results = results.filter((m) => m.category === filter.category);
    if (filter?.lowStock) results = results.filter((m) => m.quantityOnHand <= m.minQuantity);
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  update(id: string, patch: Partial<Material>): Material | null {
    const existing = this.materials.get(id);
    if (!existing) return null;
    const updated: Material = { ...existing, ...patch, id };
    this.materials.set(id, updated);
    return updated;
  }

  consume(id: string, quantity: number): Material | null {
    const material = this.materials.get(id);
    if (!material) return null;
    material.quantityOnHand = Math.max(0, material.quantityOnHand - quantity);
    this.materials.set(id, material);
    return material;
  }

  restock(id: string, quantity: number): Material | null {
    const material = this.materials.get(id);
    if (!material) return null;
    material.quantityOnHand += quantity;
    this.materials.set(id, material);
    return material;
  }

  delete(id: string): boolean {
    return this.materials.delete(id);
  }

  getLowStock(): Material[] {
    return this.list({ lowStock: true });
  }

  getTotalValue(): number {
    return [...this.materials.values()].reduce((sum, m) => sum + m.quantityOnHand * m.unitCost, 0);
  }
}

// --- CostEstimator ---

export class CostEstimator {
  private entries: Map<string, CostEntry> = new Map();

  addEntry(data: Omit<CostEntry, "id">): CostEntry {
    const entry: CostEntry = { ...data, id: crypto.randomUUID() };
    this.entries.set(entry.id, entry);
    return entry;
  }

  getEntries(projectId?: string): CostEntry[] {
    let results = [...this.entries.values()];
    if (projectId) results = results.filter((e) => e.projectId === projectId);
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getProjectTotal(projectId: string): number {
    return this.getEntries(projectId).reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalByCategory(projectId: string): Record<string, number> {
    return this.getEntries(projectId).reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  getGrandTotal(): number {
    return [...this.entries.values()].reduce((sum, e) => sum + e.amount, 0);
  }

  deleteEntry(id: string): boolean {
    return this.entries.delete(id);
  }

  estimateProject(materials: { unitCost: number; quantity: number }[], laborHours: number, laborRate = 25): number {
    const materialCost = materials.reduce((sum, m) => sum + m.unitCost * m.quantity, 0);
    return materialCost + laborHours * laborRate;
  }
}

// --- TutorialSearch ---

const SAMPLE_TUTORIALS: Tutorial[] = [
  {
    id: "t1",
    title: "Rustic Floating Shelves",
    description: "Build beautiful floating shelves from reclaimed wood with hidden brackets.",
    category: "woodworking",
    difficulty: "beginner",
    steps: [
      "Select and prepare reclaimed wood planks",
      "Cut shelves to desired length",
      "Sand and stain the wood",
      "Install hidden bracket system",
      "Mount shelves and style",
    ],
    estimatedTime: "3-4 hours",
    materialsNeeded: ["Reclaimed wood planks", "Hidden shelf brackets", "Wood stain", "Sandpaper (120 & 220 grit)", "Screws and anchors"],
    tags: ["woodworking", "shelves", "beginner", "home-decor"],
  },
  {
    id: "t2",
    title: "Hand-Poured Soy Candles",
    description: "Create custom scented soy candles in mason jars with dried flower accents.",
    category: "candles",
    difficulty: "beginner",
    steps: [
      "Melt soy wax flakes in a double boiler",
      "Add fragrance oil at 185°F",
      "Prepare jars with wicks using adhesive tabs",
      "Pour wax at 135°F",
      "Add dried flowers and let cure 48 hours",
    ],
    estimatedTime: "2 hours (+ curing time)",
    materialsNeeded: ["Soy wax flakes", "Candle fragrance oil", "Cotton wicks", "Mason jars", "Dried flowers", "Candle thermometer"],
    tags: ["candles", "soy", "home-fragrance", "gifts"],
  },
  {
    id: "t3",
    title: "Macramé Wall Hanging",
    description: "Craft a bohemian-style macramé wall hanging with square knots and fringe.",
    category: "fiber-arts",
    difficulty: "intermediate",
    steps: [
      "Cut cotton cord into 12 pieces (4m each)",
      "Mount cords on a dowel with Lark's Head knots",
      "Create rows of square knots",
      "Add spiral knot accents",
      "Trim and comb out bottom fringe",
    ],
    estimatedTime: "5-6 hours",
    materialsNeeded: ["Cotton macramé cord (5mm)", "Wooden dowel", "Scissors", "Comb", "Measuring tape"],
    tags: ["macrame", "wall-art", "boho", "fiber-arts"],
  },
  {
    id: "t4",
    title: "Concrete Planter Succulents",
    description: "Make modern concrete planters using silicone molds and plant with succulents.",
    category: "gardening",
    difficulty: "beginner",
    steps: [
      "Mix concrete with water to cake-batter consistency",
      "Pour into silicone molds",
      "Tap molds to remove air bubbles",
      "Cure for 24 hours, then demold",
      "Sand edges, paint/seal if desired, plant succulents",
    ],
    estimatedTime: "1 hour (+ 24h curing)",
    materialsNeeded: ["Quick-set concrete mix", "Silicone molds", "Sandpaper", "Succulent soil", "Succulent cuttings", "Acrylic paint (optional)"],
    tags: ["concrete", "planters", "succulents", "gardening", "modern"],
  },
  {
    id: "t5",
    title: "Live-Edge Resin River Table",
    description: "Create a stunning epoxy resin river table with live-edge wood slabs.",
    category: "woodworking",
    difficulty: "advanced",
    steps: [
      "Select and prepare matching live-edge slabs",
      "Build a melamine mold",
      "Seal wood edges and create dam",
      "Mix and pour epoxy resin in stages",
      "Demold, flatten, sand, and apply finish",
    ],
    estimatedTime: "2-3 days",
    materialsNeeded: [
      "Live-edge wood slabs (2)",
      "Epoxy resin kit",
      "Pigment/colorant",
      "Melamine board for mold",
      "Random orbit sander",
      "Polyurethane finish",
    ],
    tags: ["woodworking", "resin", "furniture", "advanced", "epoxy"],
  },
  {
    id: "t6",
    title: "Tie-Dye Shibori Linen Napkins",
    description: "Create elegant indigo shibori-dyed linen napkins with folding techniques.",
    category: "textiles",
    difficulty: "beginner",
    steps: [
      "Pre-wash linen napkins",
      "Fold and bind with rubber bands or twine",
      "Prepare indigo dye bath",
      "Submerge napkins for 5-10 minutes",
      "Rinse, unbind, wash, and iron",
    ],
    estimatedTime: "2-3 hours",
    materialsNeeded: ["Linen napkins", "Indigo dye kit", "Rubber bands", "Twine", "Rubber gloves", "5-gallon bucket"],
    tags: ["tie-dye", "shibori", "textiles", "napkins", "indigo"],
  },
];

export class TutorialSearch {
  private tutorials: Tutorial[] = [...SAMPLE_TUTORIALS];

  search(query?: string, filters?: { category?: string; difficulty?: string }): Tutorial[] {
    let results = [...this.tutorials];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q)) ||
          t.materialsNeeded.some((m) => m.toLowerCase().includes(q)),
      );
    }
    if (filters?.category) results = results.filter((t) => t.category === filters.category);
    if (filters?.difficulty) results = results.filter((t) => t.difficulty === filters.difficulty);
    return results;
  }

  get(id: string): Tutorial | undefined {
    return this.tutorials.find((t) => t.id === id);
  }

  list(): Tutorial[] {
    return [...this.tutorials];
  }

  getByCategory(category: string): Tutorial[] {
    return this.tutorials.filter((t) => t.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.tutorials.map((t) => t.category))];
  }
}
