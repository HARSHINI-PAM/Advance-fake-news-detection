import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult, SampleArticle } from "@/types/analysis";
import { analyzeFakeNews } from "@/utils/fakeNewsDetector";

interface SampleArticlesProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
  isAnalyzing: boolean;
}

const sampleArticles: SampleArticle[] = [
  {
    id: "1",
    title: "Scientists Announce Breakthrough in Renewable Energy Storage",
    content: "Researchers at MIT have developed a new battery technology that could revolutionize renewable energy storage. The lithium-metal battery demonstrates unprecedented energy density and charging speed. The research team, led by Dr. Sarah Johnson, published their findings in Nature Energy journal. The technology uses a novel solid electrolyte that prevents dendrite formation, a major challenge in lithium-metal batteries. Initial tests show the battery can charge to 80% capacity in just 10 minutes while maintaining stability over 10,000 charge cycles. The research was funded by the Department of Energy and several private investors. Commercial applications could begin within 5-7 years pending further testing and regulatory approval.",
    source: "BBC News",
    category: "Technology",
    expectedResult: "REAL"
  },
  {
    id: "2",
    title: "SHOCKING: Aliens Land in Central Park, Government Covers Up Truth",
    content: "BREAKING NEWS: Multiple witnesses report seeing UFO landing in Central Park last night!!! Government agents immediately cordoned off the area and are refusing to comment. Sources close to the White House say President is in emergency meetings with military officials. The aliens allegedly made contact with several joggers before disappearing into thin air. This reporter has exclusive photos that THEY don't want you to see! Wake up people - the truth is finally coming out! Share this before it gets deleted! The mainstream media won't report this because they're all controlled by the deep state. Several Hollywood celebrities have already tweeted their support for disclosure. This is the moment we've all been waiting for!!!",
    source: "Alternative Truth Network",
    category: "Conspiracy",
    expectedResult: "FAKE"
  },
  {
    id: "3",
    title: "India's GDP Growth Exceeds Expectations in Q3",
    content: "India's economy expanded by 7.6% in the third quarter, surpassing economist forecasts of 7.2%. The Reserve Bank of India reported that robust domestic demand and strong manufacturing output drove the growth. Finance Minister Nirmala Sitharaman stated that the government's infrastructure spending and digital initiatives contributed significantly to the positive numbers. The services sector, which accounts for more than half of India's economy, grew by 8.1%. Industrial production increased by 6.8%, with automobile and pharmaceutical sectors leading the gains. Economists predict India will remain one of the fastest-growing major economies globally. The rupee strengthened against the dollar following the announcement.",
    source: "The Times of India",
    category: "Economics",
    expectedResult: "REAL"
  },
  {
    id: "4",
    title: "Miracle Cure: Doctors Hate This One Simple Trick That Cures Everything",
    content: "Local mom discovers amazing secret that Big Pharma doesn't want you to know! Susan from Ohio used this ONE WEIRD TRICK to cure her diabetes, arthritis, and depression in just 7 days! Doctors are furious because this simple method is putting them out of business. The secret ingredient that you probably have in your kitchen right now can cure over 200 diseases including cancer! Click here to discover what it is before the government bans this information! Limited time offer - this video will be taken down soon. Thousands of people have already been cured using this method. Don't let the medical establishment keep you sick for profit. Act now before it's too late! WARNING: This may shock you!",
    source: "Natural Health Secrets",
    category: "Health",
    expectedResult: "FAKE"
  },
  {
    id: "5",
    title: "Chennai Metro Phase II Project Receives Environmental Clearance",
    content: "The Tamil Nadu government announced that the Chennai Metro Rail Phase II project has received environmental clearance from the Ministry of Environment and Climate Change. The 118.9 km extension will connect key areas including the airport, Kilambakkam bus terminus, and IT corridors in OMR and GST Road. Tamil Nadu Chief Minister M.K. Stalin said the project will improve connectivity and reduce traffic congestion in the city. The project is estimated to cost ₹61,843 crore and is expected to be completed by 2027. Japanese International Cooperation Agency (JICA) is providing funding assistance. The new lines will serve an estimated 1.5 million passengers daily once operational.",
    source: "The Hindu",
    category: "Infrastructure",
    expectedResult: "REAL"
  },
  {
    id: "6",
    title: "BREAKING: Cow Urine Cures COVID-19, Scientists Shocked by Ancient Indian Wisdom",
    content: "AMAZING DISCOVERY that Western medicine doesn't want you to know! Ancient Indian Ayurvedic texts reveal that cow urine is the ULTIMATE CURE for COVID-19 and all variants! Local cow shelter owner claims 100% success rate - ZERO deaths among people who drink fresh cow urine daily! Big Pharma companies are FURIOUS because this free natural remedy will destroy their billion-dollar vaccine profits! The government is trying to suppress this information but brave Hindu saints are spreading the TRUTH! Drink 500ml of fresh cow urine every morning and you will NEVER get sick again! Western doctors HATE this one simple trick! Share before it gets banned!",
    source: "Ayurvedic Truth Daily",
    category: "Health",
    expectedResult: "FAKE"
  },
  {
    id: "7",
    title: "India and France Strengthen Defense Cooperation with New Maritime Security Agreement",
    content: "External Affairs Minister S. Jaishankar and his French counterpart Catherine Colonna signed a comprehensive maritime security partnership during the strategic dialogue in New Delhi. The agreement focuses on enhancing cooperation in the Indian Ocean region, information sharing on maritime threats, and joint naval exercises. Defense Minister Rajnath Singh highlighted that the partnership aligns with India's Indo-Pacific strategy. The deal includes technology transfer for submarine maintenance and joint development of maritime surveillance systems. Both nations emphasized the importance of keeping sea lanes open and secure. The agreement also covers cooperation in cybersecurity and space-based maritime domain awareness.",
    source: "Hindustan Times",
    category: "Defense",
    expectedResult: "REAL"
  },
  {
    id: "8",
    title: "Federal Reserve Announces Interest Rate Decision",
    content: "The Federal Reserve announced today that it will maintain the federal funds rate at its current level of 5.25-5.50%. Fed Chair Jerome Powell stated during the press conference that the decision reflects the committee's assessment of current economic conditions and inflation trends. Recent economic data shows inflation has decreased to 3.2% year-over-year, down from the previous month's 3.4%. The unemployment rate remains steady at 3.8%. Powell emphasized the Fed's commitment to bringing inflation back to the 2% target while maintaining employment stability. The next Federal Open Market Committee meeting is scheduled for December 12-13. Financial markets responded positively to the announcement, with major indices closing up 0.8%.",
    source: "Reuters",
    category: "Economics",
    expectedResult: "REAL"
  },
  {
    id: "9",
    title: "Bengaluru IT Companies Report Record Quarterly Profits Despite Global Slowdown",
    content: "Major IT services companies based in Bengaluru reported strong quarterly results, with Infosys, Wipro, and Mphasis beating revenue expectations. Infosys reported a 15.4% increase in consolidated revenue at ₹37,441 crore for Q3. CEO Salil Parekh attributed the growth to strong demand in financial services and healthcare verticals. Wipro's revenue grew 12.8% year-on-year to ₹22,539 crore, driven by digital transformation projects. The companies have been investing heavily in artificial intelligence and cloud computing capabilities. Industry experts note that Indian IT firms are well-positioned to benefit from enterprises' increasing focus on digitalization. The sector continues to be a major contributor to Karnataka's economy.",
    source: "Deccan Chronicle",
    category: "Technology",
    expectedResult: "REAL"
  },
  {
    id: "10",
    title: "EXPLOSIVE: Modi Government Secretly Planning to Sell India to China, Insider Reveals",
    content: "SHOCKING REVELATION from anonymous government source! The current government is secretly negotiating to SELL ENTIRE INDIA to Chinese corporations! Documents leaked to our reporters show that Ladakh, Arunachal Pradesh already promised to China in exchange for personal wealth! The mainstream media is SILENT because they're all paid by Chinese money! Wake up Indians - our motherland is being sold while we sleep! The evidence is OVERWHELMING but YouTube and Facebook are deleting all videos exposing this CONSPIRACY! Share this immediately before the government blocks this website! Only patriotic citizens can save India now! The truth is more shocking than you can imagine!",
    source: "Patriot News India",
    category: "Politics",
    expectedResult: "FAKE"
  },
  {
    id: "11",
    title: "Kerala Launches Comprehensive Digital Health Mission Across All Districts",
    content: "The Kerala government unveiled its ambitious Digital Health Mission, aiming to digitize health records across all 14 districts by 2025. Health Minister Veena George announced that the initiative will integrate primary health centers, district hospitals, and medical colleges under a unified digital platform. The system will provide unique health IDs to all residents and enable real-time monitoring of health indicators. The project, developed in partnership with the Centre for Development of Advanced Computing (C-DAC), includes telemedicine capabilities for remote areas. Initial implementation in Thiruvananthapuram and Kochi districts showed promising results in reducing patient waiting times and improving care coordination. The mission is expected to benefit over 3.5 crore residents.",
    source: "The New Indian Express",
    category: "Healthcare",
    expectedResult: "REAL"
  },
  {
    id: "12",
    title: "MIRACLE BREAKTHROUGH: Turmeric and Yoga Cure Cancer Better Than Chemotherapy, Doctors Stunned",
    content: "ANCIENT INDIAN WISDOM PROVEN BY SCIENCE! Revolutionary study shows that daily turmeric consumption with yoga practice cures cancer 500% better than expensive chemotherapy! Hospital oncologists are FURIOUS because this natural treatment costs only ₹50 per day! Cancer patients are throwing away their chemo drugs and embracing this AMAZING discovery! Big Pharma mafia is trying to suppress this research but brave Indian doctors are fighting back! The secret combination of haldi powder with specific yoga asanas literally melts tumors within weeks! Western medicine EXPOSED as money-making scam! Share this life-saving information before it gets banned by medical lobby!",
    source: "Natural Healing India",
    category: "Health",
    expectedResult: "FAKE"
  }
];

const SampleArticles = ({ onAnalysisComplete, onAnalysisStart, isAnalyzing }: SampleArticlesProps) => {
  const { toast } = useToast();

  const handleAnalyzeSample = async (article: SampleArticle) => {
    onAnalysisStart();

    try {
      const fullText = `${article.title} ${article.content}`;
      const result = await analyzeFakeNews(fullText);
      onAnalysisComplete(result);
      
      toast({
        title: "Sample Analysis Complete",
        description: `Expected: ${article.expectedResult}, Predicted: ${result.prediction}`,
      });
    } catch (error) {
      console.error('Sample analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the sample article. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Test the detector with these sample articles from different news sources:
      </p>
      
      <div className="grid gap-4">
        {sampleArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base leading-tight">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {article.source} • {article.category}
                  </CardDescription>
                </div>
                <Badge 
                  variant={article.expectedResult === 'REAL' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  {article.expectedResult}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {article.content.substring(0, 150)}...
              </p>
              <Button
                size="sm"
                onClick={() => handleAnalyzeSample(article)}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3 w-3" />
                    Analyze This Sample
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SampleArticles;
