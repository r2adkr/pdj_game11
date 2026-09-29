import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
}) : null;

// Endpoint: Jimini AI Mystery Detective Case Engine
app.post('/api/ai/investigate', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Jimini API 키가 설정되지 않았습니다.' });
    }

    const { caseTitle, caseSummary, history, userChoice, modelName, targetSuspect, isSnsClue, registeredClues } = req.body;

    // Use reliable gemini-3.8-flash model
    const chosenModel = 'gemini-3.8-flash';

    // Format previous turn history to prevent repetition
    const conversationHistorySummary = Array.isArray(history)
      ? history
          .slice(-8)
          .map((m: any) => `${m.sender === 'user' ? '👉 탐정 선택' : '🤖 Jimini 브리핑'}: ${m.text.slice(0, 150)}`)
          .join('\n\n')
      : '';

    const cluesListSummary = Array.isArray(registeredClues) && registeredClues.length > 0
      ? registeredClues.join('\n- ')
      : '아직 수집된 단서 없음';

    const systemInstruction = `
    당신은 추리 게임의 유쾌하고 명석한 AI 조수 'Jimini(지미니)'입니다.
    플레이어인 수석 탐정(pai님)과 함께 사건 현장 수색, 용의자 심문, Fakebook/트위터/인스타그램 디지털 증거를 종합하여 사건을 해결합니다.

    ★ [절대 준수 수사 규칙]:
    1. 【반복 금지 (Zero Repetition)】: 이전 대화에서 나온 멘트, 설명, 단서, 선택지 문구를 절대로 반복하지 마십시오. 플레이어가 누른 선택지("${userChoice}")에 정확히 대응하는 새로운 사건 전개와 현장/인물 반응을 서술하십시오.
    2. 【쉬운 대화체】: 마크다운(볼드, 불렛, 이모지)을 활용해 만화나 웹소설처럼 술술 읽히는 명쾌하고 생생한 한국어로 작성하십시오.
    3. 【단계별 단서와 혐의점】:
       - 현장 수색 시: 핏자국 각도, 미세 와이어, 소화기 뒤 열쇠, 약품 잔여물 등 구체적인 물리 증거 설명.
       - 용의자 심문 시: 그 인물의 표정 변화, 떨리는 목소리, 당황하며 둘러대는 모순된 변명 서술.
       - SNS 단서 분석 시: 온라인에 남긴 게시글과 실제 알리바이 간의 명백한 시간대 충돌 지적.
    4. 【새로운 선택지 4개 생성】: 이전 선택지와 겹치지 않는, 사건을 더 깊이 파고들 수 있는 신선한 선택지 4개를 반환하십시오.
    5. 【진범 확정】: 지목된 용의자가 핵심 물증(소화기 뒤 열쇠, 마취용제 밀거래 등)에 걸려들었거나 자백 단계라면 isSolved=true와 함께 전율의 자백 씬을 반환하십시오.

    반드시 지정된 JSON 스키마로만 응답하십시오.
    `;

    const prompt = `
    [수사 대상 사건]: ${caseTitle || '사건 파일'}
    [사건 개요]: ${caseSummary}

    [지금까지의 대화 및 수사 내역]:
    ${conversationHistorySummary || '사건 수사 시작'}

    [플레이어가 직접 수집/등록한 단서 목록]:
    - ${cluesListSummary}

    [탐정 pai님의 최신 선택 및 조사 지시]:
    "${userChoice}"
    ${targetSuspect ? `[대상 용의자]: "${targetSuspect}"` : ''}
    ${isSnsClue ? `[특이사항: SNS/온라인 포렌식 단서 연계 조사]` : ''}

    위 지시의 결과를 구체적이고 새롭게 분석하고, 이전에 나온 적 없는 새로운 다음 수사 선택지 4개를 만들어 주세요.
    `;

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING, description: 'Jimini의 생생한 수사 결과 브리핑 (2-4문단)' },
            newClues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '새롭게 밝혀진 단서 목록',
            },
            suspectsUpdate: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  suspicionLevel: { type: Type.INTEGER, description: '0-100 의심도' },
                  alibiText: { type: Type.STRING },
                },
                required: ['name', 'role', 'suspicionLevel', 'alibiText'],
              },
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  label: { type: Type.STRING },
                },
                required: ['id', 'label'],
              },
            },
            isSolved: { type: Type.BOOLEAN },
            culpritName: { type: Type.STRING },
          },
          required: ['replyText', 'newClues', 'suspectsUpdate', 'options', 'isSolved'],
        },
      },
    });

    const resultData = JSON.parse(response.text || '{}');
    res.json(resultData);
  } catch (error: any) {
    console.error('Error in /api/ai/investigate:', error);
    res.status(500).json({
      error: error?.message || '수사 분석 도중 오류가 발생했습니다.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(
          url,
          `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jimini AI 추리 탐정: 사건 인터랙티브 추리 게임</title>
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
