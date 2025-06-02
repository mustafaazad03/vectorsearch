import { DateRange, SearchResult, TranscriptData } from "@/types";

export const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    company: 'GOOGL',
    title: 'Alphabet Inc. Presents at BofA Securities Auto-motive Summit, Apr-15-2025 08:50 AM',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'conference',
    isSelected: true
  },
  {
    id: '2',
    company: 'GOOGL',
    title: 'Alphabet Inc. Presents at BofA Securities Auto-motive Summit, Apr-15-2025 08:50 AM',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'conference'
  },
  {
    id: '3',
    company: 'GOOGL',
    title: 'Alphabet Inc. 10-K Q4 FY 2024, Apr-15-2025 08:50 AM',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'earnings'
  },
  {
    id: '4',
    company: 'GOOGL',
    title: 'Alphabet Inc., Employee Reviews',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'product'
  },
  {
    id: '5',
    company: 'GOOGL',
    title: 'Alphabet Inc., Product Reviews',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'product'
  },
  {
    id: '6',
    company: 'GOOGL',
    title: 'Alphabet Inc., Sales Insight',
    date: 'Nov 23, 2024',
    time: '2:50 AM',
    type: 'earnings'
  }
];

export const mockTranscriptData: TranscriptData = {
  title: 'Alphabet Inc. Presents at BofA Securities Auto-motive Summit, Apr-15-2025 08:50 AM',
  date: 'Apr 15, 2025',
  participants: [
    {
      name: 'Alan S. Lowe',
      title: 'President, CEO & Director',
      company: 'Lumentum Holdings Inc.'
    },
    {
      name: 'Simon Matthew Leopold',
      title: 'Research Division, MD & Research Analyst',
      company: 'Raymond James & Associates, Inc.'
    }
  ],
  segments: [
    {
      speaker: 'Simon Matthew Leopold',
      content: "Well, thanks a lot, folks, for joining us. My name is Simon Leopold from Raymond James. We're here at our Annual Tech Conference here in New York. And we've got a fireside chat session with Alan Lowe, the CEO of Lumentum. Alan, thanks for joining us."
    },
    {
      speaker: 'Alan S. Lowe',
      content: "Pleasure. We know it's a heavy conference season, and so you're bouncing back and forth. And so I appreciate you making the trip to the East Coast. This is where the investors are. So it's good to be here. So I think it's sort of nice in terms of a December conference to sort of think about the next year. So I know you're on a fiscal year ending in June, but how do you sort of -- what's sort of your expectation, your high-level view of what's in store for us in calendar '25?"
    },
    {
      speaker: 'Simon Matthew Leopold',
      content: "Well, thanks a lot, folks, for joining us. My name is Simon Leopold from Raymond James. We're here at our Annual Tech Conference here in New York. And we've got a fireside chat session with Alan Lowe, the CEO of Lumentum. Alan, thanks for joining us."
    },
    {
      speaker: 'Alan S. Lowe',
      content: "Yes. Well, it's a super exciting time for us at Lumentum. And I think we made a very strategic acquisition and pivot a year ago, November of 2023 to get us one step closer to the hyperscalers and AI. And so we see very strong demand, both from our components, our EML laser chips that go into transceivers, into the hyperscalers as well as the transceivers themselves. And over the last couple of earnings calls, we've made announcements about new customer wins, and we're doing quite well in our strategy to diversify our customer base as well as to ramp our production outside of China, which is going very well and then continue to innovate and drive innovation in photonics to enable the next generation of AI and machine learning so that will be critically important to our customers, not just in '25, but also '26 and beyond."
    }
  ]
};
const today = new Date();
const currentDate = today.getDate().toString() + " / " + String(today.getMonth() + 1) + " / " + today.getFullYear().toString();

export const mockDateRanges: DateRange[] = [
  { label: 'All dates', value: 'all', selected: false },
  { label: 'Last 2 days', value: '2days', selected: false },
  { label: 'Last 1 week', value: '1week', selected: false },
  { label: 'Last 2 weeks', value: '2weeks', selected: false },
  { label: 'Last 1 month', value: '1month', selected: false },
  { label: 'Last 3 months', value: '3months', selected: false },
  { label: 'Last 6 months', value: '6months', selected: false },
  { label: currentDate, value: 'custom', selected: true }
];