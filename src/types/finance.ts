export type ExpenseCategory = 
  | 'Housing & Rent'
  | 'Food & Groceries'
  | 'Dining & Coffee'
  | 'Transport & Fuel'
  | 'Utilities & Internet'
  | 'Subscriptions & SaaS'
  | 'Health & Wellness'
  | 'Shopping & Lifestyle'
  | 'Investments & Savings'
  | 'Debt & Loans'
  | 'Misc';

export type BudgetRuleType = 'Needs' | 'Wants' | 'Savings/Debt';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  ruleType: BudgetRuleType;
  date: string;
  notes?: string;
  isRecurring?: boolean;
}

export interface BudgetGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  color: string;
}

export interface FinancialProfile {
  monthlyIncome: number;
  currency: string;
  currencySymbol: string;
  savingsRateTarget: number; // e.g. 25%
}

export interface AIAdvisorInsight {
  healthScore: number;
  statusSummary: string;
  monthlySavingsEstimated: string;
  leaksIdentified: string[];
  aiToolRecommendations: {
    name: string;
    category: string;
    benefit: string;
  }[];
  actionSteps: string[];
}
