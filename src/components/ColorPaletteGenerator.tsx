import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { 
  generatePalette, 
  isValidHex, 
  formatHexInput,
  LUMINANCE_RANGES,
  GRADES
} from '../utils/colorUtils';
import { ChevronDown, Copy, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface PaletteItem {
  grade: number;
  color: string;
  luminance: number;
  isInputColor: boolean;
}

export function ColorPaletteGenerator() {
  const [hexColor, setHexColor] = useState('#7BC4E8');
  const [palette, setPalette] = useState<PaletteItem[]>([]);
  const [inputGradeInfo, setInputGradeInfo] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'table'>('palette');
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHexInput(e.target.value);
    setHexColor(formatted);
  };

  const copyToClipboard = async (text: string) => {
    let copySuccessful = false;
    
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copySuccessful = true;
      }
    } catch (err) {
      // Clipboard API failed, try fallback
      console.log('Clipboard API failed, trying fallback method');
    }
    
    if (!copySuccessful) {
      try {
        // Fallback for environments where Clipboard API is not available or blocked
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          copySuccessful = true;
        }
      } catch (fallbackErr) {
        console.error('Fallback copy method failed:', fallbackErr);
      }
    }
    
    if (copySuccessful) {
      setCopiedColor(text);
      setTimeout(() => setCopiedColor(null), 2000);
      toast.success(`Copied ${text} to clipboard!`);
    } else {
      toast.error(`Failed to copy. Please manually copy: ${text}`);
    }
  };

  // Update palette when hex color changes
  useEffect(() => {
    // Only show error if user has entered at least 7 characters (including #)
    if (hexColor.length >= 7 && !isValidHex(hexColor)) {
      setShowError(true);
      setShowWarning(false);
      return;
    } else {
      setShowError(false);
    }

    try {
      // Try to generate palette even if not complete yet
      if (hexColor.length >= 4) { // At least #RGB format
        const paddedHex = hexColor.padEnd(7, '0');
        const result = generatePalette(paddedHex);
        setPalette(result.palette);
        setInputGradeInfo(result.inputGradeInfo);
        
        // Show warning if not an exact grade match and hex is complete
        const shouldShowWarning = !result.inputGradeInfo.exact && hexColor.length >= 7;
        setShowWarning(shouldShowWarning);
        
        if (shouldShowWarning) {
          if (result.inputGradeInfo.lowerGrade !== null && result.inputGradeInfo.higherGrade !== null) {
            setWarningText(`Your color falls between grades ${result.inputGradeInfo.lowerGrade} and ${result.inputGradeInfo.higherGrade}. Using closest grade ${result.inputGradeInfo.grade}.`);
          } else {
            setWarningText(`Your color doesn't match any exact grade. Using closest grade ${result.inputGradeInfo.grade}.`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating palette:', error);
    }
  }, [hexColor]);

  const ColorCard = ({ item }: { item: PaletteItem }) => {
    const isActive = item.grade === inputGradeInfo?.grade;
    
    return (
      <div className={`bg-white/80 backdrop-blur-sm overflow-hidden transition-all duration-200 border relative hover:shadow-lg group rounded-none ${
        isActive ? 'shadow-[0_0_0_2px_#000] border-transparent' : 'border-gray-200'
      }`}>
        <div
          className="w-full cursor-pointer text-left"
          onClick={() => copyToClipboard(item.color)}
        >
          <div 
            className="h-28 w-full relative flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            <div 
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 border-none text-sm font-medium cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 rounded-none pointer-events-none"
            >
              {copiedColor === item.color ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  Grade {item.grade}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono mb-1">
              {item.color}
            </div>
            <div className="text-xs text-gray-500">
              Luminance: {item.luminance.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TableRow = ({ item }: { item: PaletteItem }) => {
    const isActive = item.grade === inputGradeInfo?.grade;
    const range = LUMINANCE_RANGES.find(range => range.grade === item.grade);
    
    return (
      <tr className={`relative h-12 hover:bg-gray-50 group ${isActive ? 'bg-gray-50' : ''}`}>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap">
          <div className="flex items-center gap-2 h-12">
            {isActive && <div className="w-2 h-2 bg-black rounded-full"></div>}
            {item.grade}
          </div>
        </td>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap">
          <button
            className="w-8 h-8 rounded-none border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            style={{ backgroundColor: item.color }}
            onClick={() => copyToClipboard(item.color)}
          />
        </td>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap font-mono text-gray-500">
          {item.color}
        </td>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap">
          {item.luminance.toFixed(3)}
        </td>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap">
          {range ? `${range.min.toFixed(3)} - ${range.max.toFixed(3)}` : ''}
        </td>
        <td className="px-6 py-2 text-sm border-b border-gray-200 whitespace-nowrap w-10">
          <button
            className="opacity-0 hover:opacity-100 bg-none border-none cursor-pointer text-gray-500 hover:text-black transition-all w-6 h-6 flex items-center justify-center group-hover:opacity-100"
            onClick={() => copyToClipboard(item.color)}
          >
            {copiedColor === item.color ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 p-6 mb-10">
        <div className="max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="hexInput" className="block text-lg font-medium text-gray-900 mb-3">
                Base Color (HEX)
              </label>
              <Input
                id="hexInput"
                type="text"
                value={hexColor}
                onChange={handleInputChange}
                placeholder="#000000"
                className="w-full text-lg font-mono border-2 border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent p-3"
              />
              
              {showWarning && (
                <div className="flex items-center gap-2 mt-2 text-sm text-black">
                  <AlertCircle className="w-4 h-4" />
                  <span>{warningText}</span>
                </div>
              )}
              
              {showError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter a valid hex color code</span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full sm:w-auto justify-between sm:justify-start gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 font-medium sm:mt-11 p-3"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-900">Palette Generator Guide</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {showGuide && (
            <div className="mt-2 text-sm text-gray-600 bg-transparent border-none p-0">
              <p className="mb-2">
                This tool is inspired by{' '}
                <a 
                  href="https://designsystem.digital.gov/design-tokens/color/overview/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-black font-medium underline hover:text-gray-600"
                >
                  USWDS
                </a>
                , and Salesforce Lightning Design System, to help you create color combinations that meet accessibility standards.
              </p>
              <p className="mb-2">
                System assigns each color a grade from 0 (white) to 100 (black).
              </p>
              <p className="mb-2">
                The "magic number" is simply the difference between the grades of two colors.
              </p>
              <p className="font-medium text-gray-900 mt-1 mb-1">Accessibility levels:</p>
              <ul className="list-disc list-inside ml-2 mb-2 space-y-1">
                <li>40+: Meets WCAG 2.2 AA for large text (3+)</li>
                <li>50+: Meets WCAG 2.2 AA for standard text and AAA for large text (4.5+)</li>
                <li>70+: Meets WCAG 2.2 AAA for standard text (7+)</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button
          className={`py-4 px-1 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'palette'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('palette')}
        >
          Color Palette
        </button>
        <button
          className={`py-4 px-1 border-b-2 text-sm font-medium transition-all ${
            activeTab === 'table'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('table')}
        >
          Luminance Table
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'palette' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {palette.map((item) => (
            <ColorCard key={item.grade} item={item} />
          ))}
        </div>
      )}

      {activeTab === 'table' && (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse border-spacing-0">
            <thead>
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 whitespace-nowrap">
                  Grade
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 whitespace-nowrap">
                  Color
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 whitespace-nowrap">
                  Hex code
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 whitespace-nowrap">
                  Luminance
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 whitespace-nowrap">
                  Target range
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200 h-10 w-10">
                </th>
              </tr>
            </thead>
            <tbody>
              {palette.map((item) => (
                <TableRow key={item.grade} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}