import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AnalysisResult {
  isManipulated?: boolean;
  isDeepfake?: boolean;
  confidence: number;
  manipulationScore?: number;
  detectedObjects?: string[];
  inconsistentFrames?: number[];
  faceAnalysis?: {
    detected: boolean;
    anomalies: string[];
  };
  metadata: any;
}

export default function MediaAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const analyzeMedia = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    const endpoint = file.type.startsWith('image/') ? 'image' : 'video';
    formData.append(endpoint, file);

    try {
      const response = await fetch(`${API_URL}/media/analyze/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setResult(result);

      toast({
        title: "Analysis Complete",
        description: `${file.type.startsWith('image/') ? 'Image' : 'Video'} analyzed successfully`,
      });
    } catch (error) {
      console.error('Media analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const isImage = file?.type.startsWith('image/');
    const detectionType = isImage ? 'Manipulation' : 'Deepfake';
    const detectionScore = isImage ? result.manipulationScore : result.confidence;
    const isDetected = isImage ? result.isManipulated : result.isDeepfake;

    return (
      <div className="mt-4 space-y-4">
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Analysis Results
          </h3>
          <div className="space-y-2">
            <p className="flex items-center space-x-2">
              <span className="font-medium">{detectionType} Detection:</span>
              <span className={isDetected ? 'text-red-600' : 'text-green-600'}>
                {isDetected ? 'Detected' : 'Not Detected'}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-medium">Confidence:</span>
              <span>{(detectionScore * 100).toFixed(1)}%</span>
            </p>
            {result.detectedObjects && (
              <div>
                <span className="font-medium">Detected Objects:</span>
                <ul className="list-disc list-inside ml-2">
                  {result.detectedObjects.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.faceAnalysis && (
              <div>
                <span className="font-medium">Face Analysis:</span>
                <p className="ml-2">
                  {result.faceAnalysis.detected
                    ? `Anomalies detected: ${result.faceAnalysis.anomalies.join(', ')}`
                    : 'No faces detected'}
                </p>
              </div>
            )}
          </div>
        </div>

        {isDetected && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Warning</h4>
                <p className="text-red-700">
                  This {isImage ? 'image' : 'video'} shows signs of
                  {isImage ? ' manipulation' : ' being a deepfake'}. Exercise
                  caution when sharing or using this content.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="media">Upload Media File</Label>
          <Input
            id="media"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isAnalyzing}
          />
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: Images (JPG, PNG) and Videos (MP4) up to 10MB
          </p>
        </div>

        <Button
          onClick={analyzeMedia}
          disabled={!file || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {file?.type.startsWith('image/') ? (
                <ImageIcon className="mr-2 h-4 w-4" />
              ) : (
                <Video className="mr-2 h-4 w-4" />
              )}
              Analyze {file?.type.startsWith('image/') ? 'Image' : 'Video'}
            </>
          )}
        </Button>

        {renderResult()}
      </div>
    </Card>
  );
}
