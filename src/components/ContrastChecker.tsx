import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { calculateContrastRatio, isValidHex, formatHexInput } from '../utils/colorUtils';
import { AlertCircle, Check, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ContrastChecker() {
  const [foregroundColor, setForegroundColor] = useState('#163300');
  const [backgroundColor, setBackgroundColor] = useState('#F8FCFF');
  const [foregroundError, setForegroundError] = useState(false);
  const [backgroundError, setBackgroundError] = useState(false);

  const handleForegroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHexInput(e.target.value);
    setForegroundColor(formatted);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHexInput(e.target.value);
    setBackgroundColor(formatted);
  };

  const swapColors = () => {
    const temp = foregroundColor;
    setForegroundColor(backgroundColor);
    setBackgroundColor(temp);
  };

  // Validate colors
  useEffect(() => {
    setForegroundError(foregroundColor.length >= 7 && !isValidHex(foregroundColor));
    setBackgroundError(backgroundColor.length >= 7 && !isValidHex(backgroundColor));
  }, [foregroundColor, backgroundColor]);

  // Calculate contrast ratio and compliance
  const ratio = isValidHex(foregroundColor) && isValidHex(backgroundColor) 
    ? calculateContrastRatio(foregroundColor, backgroundColor) 
    : 0;

  const aaLargePass = ratio >= 3;
  const aaNormalPass = ratio >= 4.5;
  const aaaLargePass = ratio >= 4.5;
  const aaaNormalPass = ratio >= 7;
  const aaNonTextPass = ratio >= 3;

  const ComplianceIndicator = ({ 
    pass, 
    label, 
    tooltip 
  }: { 
    pass: boolean; 
    label: string; 
    tooltip: string; 
  }) => (
    <div className="flex items-center gap-2 p-2 rounded bg-gray-50">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
        pass 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {pass ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className="text-sm">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 p-6 mb-10">
      <div className="max-w-full">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input Controls */}
          <div className="w-full max-w-[300px] flex flex-col gap-3">
            <div>
              <label htmlFor="foregroundColor" className="block text-lg font-medium text-gray-900 mb-3">
                Text Color (HEX)
              </label>
              <Input
                id="foregroundColor"
                type="text"
                value={foregroundColor}
                onChange={handleForegroundChange}
                placeholder="#000000"
                className="w-full text-lg font-mono border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent p-3"
              />
              {foregroundError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter a valid hex color code</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="backgroundColor" className="block text-lg font-medium text-gray-900 mb-3">
                Background Color (HEX)
              </label>
              <Input
                id="backgroundColor"
                type="text"
                value={backgroundColor}
                onChange={handleBackgroundChange}
                placeholder="#FFFFFF"
                className="w-full text-lg font-mono border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent p-3"
              />
              {backgroundError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter a valid hex color code</span>
                </div>
              )}
            </div>

            <Button
              onClick={swapColors}
              variant="outline"
              className="w-full p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 font-medium"
            >
              Swap Colors
            </Button>
          </div>

          {/* Preview Section */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Preview */}
            <div 
              className="col-span-2 p-6 border border-gray-200 flex items-center justify-center"
              style={{
                color: foregroundColor,
                backgroundColor: backgroundColor
              }}
            >
              <div className="text-center">
                <p className="text-sm mb-2">Normal Text (16px)</p>
                <p className="text-2xl font-bold">Large Text (24px)</p>
              </div>
            </div>

            {/* Button Preview */}
            <div className="p-4 border border-gray-200 flex items-center justify-center">
              <button
                className="px-4 py-2 text-sm font-medium cursor-pointer"
                style={{
                  color: foregroundColor,
                  backgroundColor: backgroundColor,
                  border: 'none'
                }}
              >
                Button
              </button>
            </div>

            {/* Icon Preview */}
            <div 
              className="p-4 border border-gray-200 flex items-center justify-center"
              style={{ backgroundColor: backgroundColor }}
            >
              <svg 
                className="w-8 h-8" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={foregroundColor} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>

            {/* Results */}
            <div className="col-span-2 grid grid-cols-1 gap-4 mt-2">
              {/* Contrast Ratio */}
              <div className="bg-white border border-gray-200 p-4 text-center">
                <h3 className="font-medium mb-2">Contrast Ratio</h3>
                <div className="text-5xl font-bold text-gray-900 font-mono">
                  {ratio.toFixed(2)}:1
                </div>
              </div>

              {/* WCAG Compliance */}
              <div className="bg-white border border-gray-200 p-4">
                <h3 className="text-lg font-medium mb-4">WCAG 2.2 Compliance</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ComplianceIndicator
                    pass={aaLargePass}
                    label="AA Large Text (3:1)"
                    tooltip="Large text (at least 24px or 19px bold) must have a contrast ratio of at least 3:1 against its background to meet WCAG 2.2 AA standards."
                  />
                  
                  <ComplianceIndicator
                    pass={aaNormalPass}
                    label="AA Normal Text (4.5:1)"
                    tooltip="Normal text (less than 24px or 19px bold) must have a contrast ratio of at least 4.5:1 against its background to meet WCAG 2.2 AA standards."
                  />
                  
                  <ComplianceIndicator
                    pass={aaaLargePass}
                    label="AAA Large Text (4.5:1)"
                    tooltip="Large text (at least 24px or 19px bold) must have a contrast ratio of at least 4.5:1 against its background to meet WCAG 2.2 AAA standards."
                  />
                  
                  <ComplianceIndicator
                    pass={aaaNormalPass}
                    label="AAA Normal Text (7:1)"
                    tooltip="Normal text (less than 24px or 19px bold) must have a contrast ratio of at least 7:1 against its background to meet WCAG 2.2 AAA standards."
                  />
                  
                  <ComplianceIndicator
                    pass={aaNonTextPass}
                    label="AA Non-Text (3:1)"
                    tooltip="Non-text elements like icons, form controls, and UI components must have a contrast ratio of at least 3:1 against their background to meet WCAG 2.2 AA standards."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}