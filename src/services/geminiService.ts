interface TutorialStep {
  id: string;
  command: string;
  description: string;
  coordinates: { x: number; y: number };
  action: string;
  completed: boolean;
}

interface GeminiResponse {
  steps: TutorialStep[];
}

export async function processVoiceCommand(command: string, apiKey: string): Promise<GeminiResponse | null> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this voice command and create a step-by-step tutorial: "${command}"
            
            Please respond with a JSON object containing tutorial steps in this exact format:
            {
              "steps": [
                {
                  "id": "step-1",
                  "command": "${command}",
                  "description": "Detailed description of what to do",
                  "coordinates": {"x": 400, "y": 300},
                  "action": "Click on Gallery app",
                  "completed": false
                }
              ]
            }
            
            Create 3-5 logical steps that would help someone complete the requested task. 
            Generate realistic screen coordinates (assume 1920x1080 screen).
            Make the descriptions clear and actionable.
            Focus on common UI patterns and locations.
            
            Only respond with valid JSON, no additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini API');
    }

    // Extract JSON from the response
    let jsonStr = content.trim();
    
    // Remove any markdown code blocks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsedResponse = JSON.parse(jsonStr) as GeminiResponse;
      
      // Validate the response structure
      if (!parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
        throw new Error('Invalid response format');
      }

      // Add unique IDs if missing and ensure proper structure
      const validatedSteps = parsedResponse.steps.map((step, index) => ({
        id: step.id || `step-${index + 1}`,
        command: step.command || command,
        description: step.description || 'No description provided',
        coordinates: step.coordinates || { x: 400 + (index * 100), y: 300 + (index * 50) },
        action: step.action || `Step ${index + 1}`,
        completed: false
      }));

      return { steps: validatedSteps };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      
      // Fallback: create default steps based on common patterns
      return createFallbackSteps(command);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return fallback steps
    return createFallbackSteps(command);
  }
}

function createFallbackSteps(command: string): GeminiResponse {
  const lowerCommand = command.toLowerCase();
  
  let steps: TutorialStep[] = [];
  
  if (lowerCommand.includes('delete') && lowerCommand.includes('photo')) {
    steps = [
      {
        id: 'step-1',
        command,
        description: 'Open your photo gallery or photos app',
        coordinates: { x: 200, y: 400 },
        action: 'Open Gallery App',
        completed: false
      },
      {
        id: 'step-2',
        command,
        description: 'Find and select the photo you want to delete',
        coordinates: { x: 400, y: 300 },
        action: 'Select Photo',
        completed: false
      },
      {
        id: 'step-3',
        command,
        description: 'Look for the delete button (usually a trash icon)',
        coordinates: { x: 600, y: 100 },
        action: 'Click Delete Button',
        completed: false
      },
      {
        id: 'step-4',
        command,
        description: 'Confirm the deletion when prompted',
        coordinates: { x: 500, y: 400 },
        action: 'Confirm Delete',
        completed: false
      }
    ];
  } else if (lowerCommand.includes('email')) {
    steps = [
      {
        id: 'step-1',
        command,
        description: 'Open your email application',
        coordinates: { x: 100, y: 200 },
        action: 'Open Email App',
        completed: false
      },
      {
        id: 'step-2',
        command,
        description: 'Click on the compose or new email button',
        coordinates: { x: 150, y: 150 },
        action: 'Click Compose',
        completed: false
      },
      {
        id: 'step-3',
        command,
        description: 'Fill in the recipient email address',
        coordinates: { x: 400, y: 200 },
        action: 'Enter Recipient',
        completed: false
      },
      {
        id: 'step-4',
        command,
        description: 'Write your message and click send',
        coordinates: { x: 600, y: 500 },
        action: 'Send Email',
        completed: false
      }
    ];
  } else {
    // Generic fallback steps
    steps = [
      {
        id: 'step-1',
        command,
        description: 'Identify the relevant application or area on your screen',
        coordinates: { x: 300, y: 250 },
        action: 'Locate Target Area',
        completed: false
      },
      {
        id: 'step-2',
        command,
        description: 'Navigate to the appropriate menu or section',
        coordinates: { x: 450, y: 200 },
        action: 'Navigate to Section',
        completed: false
      },
      {
        id: 'step-3',
        command,
        description: 'Perform the requested action',
        coordinates: { x: 500, y: 350 },
        action: 'Execute Action',
        completed: false
      },
      {
        id: 'step-4',
        command,
        description: 'Verify the action was completed successfully',
        coordinates: { x: 400, y: 450 },
        action: 'Verify Completion',
        completed: false
      }
    ];
  }
  
  return { steps };
}