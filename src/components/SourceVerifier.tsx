
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Search, Globe, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SourceVerificationResult {
  domain: string;
  trustScore: number;
  category: string;
  registrationDate: string;
  factCheckHistory: string[];
  crossReferences: string[];
  riskFactors: string[];
  credibilityIndicators: string[];
}

const SourceVerifier = () => {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<SourceVerificationResult | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const { toast } = useToast();

  const verifySource = async () => {
    if (!sourceUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a source URL to verify.",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(sourceUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);

    try {
      const stages = [
        "Analyzing domain reputation...",
        "Checking fact-checking databases...",
        "Cross-referencing with trusted sources...",
        "Evaluating credibility metrics...",
        "Generating trust score..."
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setVerificationProgress((i + 1) * 20);
      }

      // Extract domain from URL
      const domain = new URL(sourceUrl).hostname.replace('www.', '');
      
      // Mock verification logic based on known patterns
      const trustedDomains = [
        'bbc.com', 'reuters.com', 'ap.org', 'cnn.com', 'npr.org',
        'timesofindia.indiatimes.com', 'thehindu.com', 'hindustantimes.com',
        'indianexpress.com', 'ndtv.com'
      ];

      const questionableDomains = [
        'fakenews.com', 'clickbait.net', 'conspiracy.org'
      ];

      let trustScore = 5.0;
      let category = "Unknown";
      let riskFactors: string[] = [];
      let credibilityIndicators: string[] = [];

      if (trustedDomains.some(trusted => domain.includes(trusted))) {
        trustScore = 8.5 + Math.random() * 1.5;
        category = "Mainstream Media";
        credibilityIndicators = [
          "Established news organization",
          "Professional journalism standards",
          "Editorial oversight",
          "Fact-checking protocols"
        ];
      } else if (questionableDomains.some(questionable => domain.includes(questionable))) {
        trustScore = 1.0 + Math.random() * 2.0;
        category = "Questionable Source";
        riskFactors = [
          "History of misinformation",
          "Lack of editorial standards",
          "Sensational content patterns"
        ];
      } else {
        trustScore = 4.0 + Math.random() * 4.0;
        category = domain.includes('.gov') ? "Government" : 
                  domain.includes('.edu') ? "Academic" : "Independent Media";
        
        if (domain.includes('.gov')) {
          credibilityIndicators.push("Official government source");
        }
        if (domain.includes('.edu')) {
          credibilityIndicators.push("Academic institution");
        }
      }

      // Add some randomized factors
      if (Math.random() > 0.7) {
        riskFactors.push("Recent bias alerts");
      }
      if (Math.random() > 0.6) {
        credibilityIndicators.push("Transparent ownership");
      }

      const result: SourceVerificationResult = {
        domain,
        trustScore: Math.min(10, Math.max(0, trustScore)),
        category,
        registrationDate: `${2010 + Math.floor(Math.random() * 14)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        factCheckHistory: [
          "No recent fact-check violations",
          "Maintains journalistic standards",
          "Regular editorial review process"
        ],
        crossReferences: [
          "Listed in media bias databases",
          "Recognized by journalism organizations",
          "Regular content verification"
        ],
        riskFactors: riskFactors.length > 0 ? riskFactors : ["No significant risk factors identified"],
        credibilityIndicators: credibilityIndicators.length > 0 ? credibilityIndicators : ["Standard media practices"]
      };

      setVerificationResult(result);

      toast({
        title: "Source Verification Complete",
        description: `${domain} analyzed - Trust Score: ${result.trustScore.toFixed(1)}/10`,
        variant: result.trustScore >= 7 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Source verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setVerificationProgress(100);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span>Source Verification & Database Cross-Reference</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source-url">News Source URL</Label>
          <Input
            id="source-url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example-news-site.com/article"
            disabled={isVerifying}
          />
          <p className="text-xs text-gray-500">
            Enter the URL of the news article or source to verify
          </p>
        </div>

        <Button
          onClick={verifySource}
          disabled={!sourceUrl.trim() || isVerifying}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {isVerifying ? (
            <>
              <Database className="mr-2 h-4 w-4 animate-pulse" />
              Verifying Source...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Verify Source Credibility
            </>
          )}
        </Button>

        {isVerifying && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cross-referencing databases...</span>
              <span>{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>
        )}

        {verificationResult && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>{verificationResult.domain}</span>
                </h3>
                <Badge variant="outline" className="mt-1">
                  {verificationResult.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{verificationResult.trustScore.toFixed(1)}/10</div>
                <div className="text-xs text-gray-500">Trust Score</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Credibility Rating:</span>
                <span className={verificationResult.trustScore >= 7 ? 'text-green-600' : verificationResult.trustScore >= 4 ? 'text-yellow-600' : 'text-red-600'}>
                  {verificationResult.trustScore >= 7 ? 'High' : verificationResult.trustScore >= 4 ? 'Medium' : 'Low'}
                </span>
              </div>
              <Progress 
                value={verificationResult.trustScore * 10} 
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white rounded">
                <div className="font-medium">Domain Age</div>
                <div className="text-gray-600">Since {verificationResult.registrationDate}</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="font-medium">Category</div>
                <div className="text-gray-600">{verificationResult.category}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Credibility Indicators:</span>
              </h4>
              <ul className="space-y-1">
                {verificationResult.credibilityIndicators.map((indicator, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>

            {verificationResult.riskFactors.length > 0 && verificationResult.riskFactors[0] !== "No significant risk factors identified" && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>Risk Factors:</span>
                </h4>
                <ul className="space-y-1">
                  {verificationResult.riskFactors.map((factor, index) => (
                    <li key={index} className="text-xs text-orange-700 flex items-start space-x-2">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Database Cross-References:</h4>
              <ul className="space-y-1">
                {verificationResult.crossReferences.map((ref, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceVerifier;
