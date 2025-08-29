import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
    }

    // For now, return a mock analysis
    // In a real implementation, you would:
    // 1. Process the image using computer vision APIs
    // 2. Extract features or descriptions
    // 3. Send the description to Ollama for further analysis

    const mockDescription = "This image appears to contain various objects and elements that could be analyzed further."

    try {
      // Try to send description to Ollama for analysis
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Please provide a detailed analysis of this image description: "${mockDescription}"`,
          stream: false,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ 
          description: mockDescription,
          analysis: data.response || 'No analysis available',
          confidence: 0.85
        })
      } else {
        // Ollama is not running or failed, return mock analysis
        return NextResponse.json({ 
          description: mockDescription,
          analysis: "This is a sample analysis. To get AI-powered analysis, make sure Ollama is running with the llama2 model.",
          confidence: 0.75,
          note: "Ollama not available - showing sample analysis"
        })
      }
    } catch (ollamaError) {
      // Ollama connection failed, return mock analysis
      console.log('Ollama not available, using mock analysis')
      return NextResponse.json({ 
        description: mockDescription,
        analysis: "This is a sample analysis. To get AI-powered analysis, make sure Ollama is running with the llama2 model.",
        confidence: 0.75,
        note: "Ollama not available - showing sample analysis"
      })
    }
  } catch (error) {
    console.error('Image analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 