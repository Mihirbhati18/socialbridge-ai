import { prisma } from '@/lib/prisma';
import { generateText } from '@/lib/gemini';

export interface ScoreBreakdown {
  historyScore: number;
  successScore: number;
  ratingScore: number;
  reliabilityScore: number;
  responseScore: number;
  distanceScore: number;
  categoryScore: number;
}

export interface PartnerRecommendation {
  organization: {
    id: string;
    name: string;
    type: string;
    description: string;
    logo?: string;
    city: string;
    rating: number;
    totalEvents: number;
    successfulEvents: number;
    categories: string;
  };
  score: number;
  breakdown: ScoreBreakdown;
  explanation: string;
}

function normalize(value: number, min: number, max: number) {
  if (min === max) return 1;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculatePartnerScore(org: any, partnershipScore: any, requestCategory: string, requestLat?: number, requestLng?: number) {
    const historyScore = normalize(partnershipScore?.pastCollaborations || 0, 0, 10);
    const successScore = normalize(org.successfulEvents || 0, 0, org.totalEvents || 1);
    const ratingScore = normalize(org.rating || 0, 0, 5);
    const reliabilityScore = normalize(partnershipScore?.reliability || 0, 0, 100);
    const responseScore = normalize(100 - (partnershipScore?.avgResponseTime || 48), 0, 100);
    
    let distanceScore = 0.5;
    if (requestLat && requestLng && org.lat && org.lng) {
        const dist = haversineDistance(requestLat, requestLng, org.lat, org.lng);
        distanceScore = normalize(100 - dist, 0, 100);
    }
    
    const categoryScore = (org.categories || '').includes(requestCategory) ? 1 : 0.2;
    
    const score = (historyScore * 0.15 + successScore * 0.2 + ratingScore * 0.15 + reliabilityScore * 0.15 + responseScore * 0.1 + distanceScore * 0.1 + categoryScore * 0.15) * 100;
    
    const breakdown: ScoreBreakdown = {
        historyScore: historyScore * 100,
        successScore: successScore * 100,
        ratingScore: ratingScore * 100,
        reliabilityScore: reliabilityScore * 100,
        responseScore: responseScore * 100,
        distanceScore: distanceScore * 100,
        categoryScore: categoryScore * 100
    };
    
    return { score: Math.round(score), breakdown };
}

export async function getRecommendations(requestId: string): Promise<PartnerRecommendation[]> {
    const request = await prisma.collabRequest.findUnique({
        where: { id: requestId }
    });
    
    if (!request) throw new Error("Request not found");
    
    const requiredTypes = request.requiredPartners ? request.requiredPartners.split(',') : [];
    
    const candidates = await prisma.organization.findMany({
        where: requiredTypes.length > 0 ? {
            type: { in: requiredTypes }
        } : undefined,
        include: {
            scores: {
                where: {
                    category: request.category.toLowerCase()
                }
            }
        }
    });
    
    let recommendations: PartnerRecommendation[] = candidates.map(org => {
        const scoreData = org.scores[0] || null;
        const { score, breakdown } = calculatePartnerScore(org, scoreData, request.category, request.lat, request.lng);
        return {
            organization: {
                id: org.id,
                name: org.name,
                type: org.type,
                description: org.description || '',
                logo: org.logo || undefined,
                city: org.city || '',
                rating: org.rating || 0,
                totalEvents: org.totalEvents || 0,
                successfulEvents: org.successfulEvents || 0,
                categories: org.categories || ''
            },
            score,
            breakdown,
            explanation: ''
        };
    }).sort((a, b) => b.score - a.score).slice(0, 10);
    
    if (recommendations.length === 0) return [];

    try {
        const prompt = `You are the SocialBridge AI Partnership Engine. For each partner, write a compelling 2-sentence explanation of why they are a great match for a collaboration request in category '${request.category}'. Be specific about their strengths. 
        Candidates: ${JSON.stringify(recommendations.map(r => ({ id: r.organization.id, name: r.organization.name, type: r.organization.type })))}
        Return a JSON array exactly in this format: [{"orgId": "string", "explanation": "string"}]`;
        
        const aiResponse = await generateText(prompt);
        const match = aiResponse.match(/\[.*\]/s);
        if (match) {
            const parsed = JSON.parse(match[0]);
            recommendations = recommendations.map(rec => {
                const aiExplanation = parsed.find((p: any) => p.orgId === rec.organization.id);
                if (aiExplanation) {
                    rec.explanation = aiExplanation.explanation;
                } else {
                    rec.explanation = `${rec.organization.name} is a strong match based on our AI evaluation of their past performance and relevance to your needs.`;
                }
                return rec;
            });
        } else {
            throw new Error("Invalid AI response format");
        }
    } catch (e) {
        console.error("Failed to generate explanations", e);
        recommendations = recommendations.map(rec => ({
            ...rec,
            explanation: `${rec.organization.name} is recommended due to their ${rec.breakdown.categoryScore > 80 ? 'strong category match' : 'solid overall performance'} and proven track record.`
        }));
    }
    
    return recommendations;
}
