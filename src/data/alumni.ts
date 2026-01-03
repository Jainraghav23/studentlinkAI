export interface Alumni {
  id: string;
  name: string;
  graduationYear: number;
  currentRole: string;
  company: string;
  location: string;
  linkedIn?: string;
  email?: string;
  specialization: string;
  avatar?: string;
}

export const alumni: Alumni[] = [
  // 2024 Cohort
  { id: "1", name: "Sarah Chen", graduationYear: 2024, currentRole: "Strategy Consultant", company: "McKinsey & Company", location: "New York, NY", specialization: "Strategy" },
  { id: "2", name: "Michael Rodriguez", graduationYear: 2024, currentRole: "Product Manager", company: "Google", location: "San Francisco, CA", specialization: "Technology" },
  { id: "3", name: "Priya Sharma", graduationYear: 2024, currentRole: "Investment Associate", company: "Goldman Sachs", location: "London, UK", specialization: "Finance" },
  
  // 2023 Cohort
  { id: "4", name: "James Thompson", graduationYear: 2023, currentRole: "Founder & CEO", company: "TechVenture Labs", location: "Austin, TX", specialization: "Entrepreneurship" },
  { id: "5", name: "Emily Watson", graduationYear: 2023, currentRole: "Brand Director", company: "Nike", location: "Portland, OR", specialization: "Marketing" },
  { id: "6", name: "David Kim", graduationYear: 2023, currentRole: "Senior Analyst", company: "Bain & Company", location: "Boston, MA", specialization: "Strategy" },
  
  // 2022 Cohort
  { id: "7", name: "Lisa Anderson", graduationYear: 2022, currentRole: "VP of Operations", company: "Amazon", location: "Seattle, WA", specialization: "Operations" },
  { id: "8", name: "Robert Martinez", graduationYear: 2022, currentRole: "Portfolio Manager", company: "BlackRock", location: "New York, NY", specialization: "Finance" },
  { id: "9", name: "Jennifer Lee", graduationYear: 2022, currentRole: "Head of Growth", company: "Stripe", location: "San Francisco, CA", specialization: "Marketing" },
  
  // 2021 Cohort
  { id: "10", name: "Christopher Brown", graduationYear: 2021, currentRole: "Managing Director", company: "JP Morgan", location: "New York, NY", specialization: "Finance" },
  { id: "11", name: "Amanda Taylor", graduationYear: 2021, currentRole: "Chief Marketing Officer", company: "Shopify", location: "Toronto, CA", specialization: "Marketing" },
  { id: "12", name: "Daniel Wilson", graduationYear: 2021, currentRole: "Partner", company: "Andreessen Horowitz", location: "Menlo Park, CA", specialization: "Entrepreneurship" },
  
  // 2020 Cohort
  { id: "13", name: "Jessica Garcia", graduationYear: 2020, currentRole: "CEO", company: "HealthTech Innovations", location: "Boston, MA", specialization: "Healthcare" },
  { id: "14", name: "Matthew Davis", graduationYear: 2020, currentRole: "SVP Strategy", company: "Meta", location: "San Francisco, CA", specialization: "Strategy" },
  { id: "15", name: "Ashley Miller", graduationYear: 2020, currentRole: "Principal", company: "BCG", location: "Chicago, IL", specialization: "Strategy" },
  
  // 2019 Cohort
  { id: "16", name: "Andrew Johnson", graduationYear: 2019, currentRole: "Managing Partner", company: "Sequoia Capital", location: "San Francisco, CA", specialization: "Finance" },
  { id: "17", name: "Rachel White", graduationYear: 2019, currentRole: "Global Head of Product", company: "Uber", location: "San Francisco, CA", specialization: "Technology" },
  { id: "18", name: "Kevin Thomas", graduationYear: 2019, currentRole: "Founder", company: "Sustainable Energy Co", location: "Denver, CO", specialization: "Entrepreneurship" },
  
  // 2018 Cohort
  { id: "19", name: "Nicole Jackson", graduationYear: 2018, currentRole: "Chief Operating Officer", company: "Airbnb", location: "San Francisco, CA", specialization: "Operations" },
  { id: "20", name: "Brandon Harris", graduationYear: 2018, currentRole: "Partner", company: "Deloitte", location: "Washington, DC", specialization: "Strategy" },
  { id: "21", name: "Stephanie Clark", graduationYear: 2018, currentRole: "VP Finance", company: "Tesla", location: "Austin, TX", specialization: "Finance" },
  
  // 2017 Cohort
  { id: "22", name: "Ryan Lewis", graduationYear: 2017, currentRole: "Regional CEO", company: "Unilever Asia", location: "Singapore", specialization: "Operations" },
  { id: "23", name: "Michelle Robinson", graduationYear: 2017, currentRole: "Chief Strategy Officer", company: "Disney", location: "Los Angeles, CA", specialization: "Strategy" },
  { id: "24", name: "Timothy Walker", graduationYear: 2017, currentRole: "Co-Founder", company: "Fintech Solutions", location: "London, UK", specialization: "Finance" },
  
  // 2016 Cohort
  { id: "25", name: "Katherine Hall", graduationYear: 2016, currentRole: "CEO", company: "EdTech Pioneers", location: "San Francisco, CA", specialization: "Technology" },
  { id: "26", name: "Steven Allen", graduationYear: 2016, currentRole: "Executive VP", company: "Bank of America", location: "Charlotte, NC", specialization: "Finance" },
  { id: "27", name: "Laura Young", graduationYear: 2016, currentRole: "President", company: "Consumer Brands Inc", location: "Cincinnati, OH", specialization: "Marketing" },
  
  // 2015 Cohort
  { id: "28", name: "Mark King", graduationYear: 2015, currentRole: "Chairman", company: "Global Ventures", location: "Hong Kong", specialization: "Entrepreneurship" },
  { id: "29", name: "Elizabeth Wright", graduationYear: 2015, currentRole: "Chief Executive", company: "Healthcare Group", location: "New York, NY", specialization: "Healthcare" },
  { id: "30", name: "Joseph Scott", graduationYear: 2015, currentRole: "Senior Partner", company: "McKinsey & Company", location: "New York, NY", specialization: "Strategy" },
];

export const graduationYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

export const specializations = ["Strategy", "Finance", "Marketing", "Technology", "Operations", "Entrepreneurship", "Healthcare"];
