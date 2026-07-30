import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean up existing data to prevent unique constraint errors during seeding
  console.log('Cleaning up existing data...')
  await prisma.notification.deleteMany()
  await prisma.issueUpdate.deleteMany()
  await prisma.civicIssue.deleteMany()
  await prisma.document.deleteMany()
  await prisma.workspaceMessage.deleteMany()
  await prisma.task.deleteMany()
  await prisma.partnershipOrg.deleteMany()
  await prisma.partnership.deleteMany()
  await prisma.collabResponse.deleteMany()
  await prisma.collabRequest.deleteMany()
  await prisma.partnershipScore.deleteMany()
  await prisma.orgMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  
  // -----------------------------------------
  // 1. Users
  // -----------------------------------------
  console.log('Seeding Users...')
  
  const drPriya = await prisma.user.create({
    data: {
      email: 'priya.sharma@example.com',
      name: 'Dr. Priya Sharma',
      role: 'PROFESSIONAL',
      city: 'Mumbai',
      state: 'Maharashtra',
      skills: 'Medicine,Healthcare,Public Speaking'
    }
  })

  const rajeshPatel = await prisma.user.create({
    data: {
      email: 'rajesh.patel@hopefoundation.org',
      name: 'Rajesh Patel',
      role: 'NGO_ADMIN',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const sunitaVerma = await prisma.user.create({
    data: {
      email: 'sunita.verma@greenearth.org',
      name: 'Sunita Verma',
      role: 'NGO_ADMIN',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const amitKumar = await prisma.user.create({
    data: {
      email: 'amit.kumar@dps.edu',
      name: 'Amit Kumar',
      role: 'SCHOOL_ADMIN',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const nehaGupta = await prisma.user.create({
    data: {
      email: 'neha.gupta@iitb.ac.in',
      name: 'Neha Gupta',
      role: 'COLLEGE_ADMIN',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const drVikram = await prisma.user.create({
    data: {
      email: 'vikram.singh@lilavati.org',
      name: 'Dr. Vikram Singh',
      role: 'HOSPITAL_ADMIN',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const arjunMehta = await prisma.user.create({
    data: {
      email: 'arjun.mehta@bmc.gov.in',
      name: 'Arjun Mehta',
      role: 'GOV_OFFICIAL',
      city: 'Mumbai',
      state: 'Maharashtra'
    }
  })

  const ananyaJoshi = await prisma.user.create({
    data: {
      email: 'ananya.joshi@example.com',
      name: 'Ananya Joshi',
      role: 'STUDENT',
      city: 'Mumbai',
      state: 'Maharashtra',
      skills: 'Volunteering,Social Media,Content Writing'
    }
  })

  // -----------------------------------------
  // 2. Organizations
  // -----------------------------------------
  console.log('Seeding Organizations...')

  const hopeFoundation = await prisma.organization.create({
    data: {
      name: 'Hope Foundation',
      type: 'NGO',
      description: 'Dedicated to providing medical assistance and organizing health camps in underprivileged areas.',
      email: 'contact@hopefoundation.org',
      address: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1136,
      lng: 72.8297,
      categories: 'blood_donation,medical_camp,health',
      rating: 4.8,
      totalEvents: 45,
      successfulEvents: 42,
      verified: true
    }
  })

  const greenEarth = await prisma.organization.create({
    data: {
      name: 'Green Earth Society',
      type: 'NGO',
      description: 'Focusing on environmental sustainability and awareness.',
      email: 'hello@greenearth.org',
      address: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0596,
      lng: 72.8295,
      categories: 'environment,tree_plantation,cleanup',
      rating: 4.5,
      totalEvents: 30,
      successfulEvents: 27,
      verified: true
    }
  })

  const dps = await prisma.organization.create({
    data: {
      name: 'Delhi Public School',
      type: 'SCHOOL',
      description: 'A premier educational institution fostering holistic development.',
      email: 'info@dpsmumbai.edu',
      address: 'Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1176,
      lng: 72.9060,
      categories: 'education,blood_donation,tree_plantation',
      rating: 4.3,
      totalEvents: 20,
      successfulEvents: 18,
      verified: true
    }
  })

  const ryanIntl = await prisma.organization.create({
    data: {
      name: 'Ryan International School',
      type: 'SCHOOL',
      description: 'Nurturing global citizens through excellence in education.',
      email: 'contact@ryanmalad.edu',
      address: 'Malad West',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1860,
      lng: 72.8400,
      categories: 'education,medical_camp',
      rating: 4.1,
      totalEvents: 12,
      successfulEvents: 10,
      verified: true
    }
  })

  const iitb = await prisma.organization.create({
    data: {
      name: 'IIT Bombay',
      type: 'COLLEGE',
      description: 'Premier engineering and research institution.',
      email: 'outreach@iitb.ac.in',
      address: 'Main Gate Rd, IIT Area, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1334,
      lng: 72.9133,
      categories: 'education,innovation,mentorship',
      rating: 4.9,
      totalEvents: 35,
      successfulEvents: 33,
      verified: true
    }
  })

  const mu = await prisma.organization.create({
    data: {
      name: 'Mumbai University',
      type: 'COLLEGE',
      description: 'One of the oldest and premier universities in India.',
      email: 'contact@mu.ac.in',
      address: 'Fort Campus',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 18.9268,
      lng: 72.8315,
      categories: 'education,tree_plantation,cleanup',
      rating: 4.2,
      totalEvents: 15,
      successfulEvents: 12,
      verified: true
    }
  })

  const lilavati = await prisma.organization.create({
    data: {
      name: 'Lilavati Hospital',
      type: 'HOSPITAL',
      description: 'Multi-specialty tertiary care hospital.',
      email: 'info@lilavati.org',
      address: 'A-791, Bandra Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0504,
      lng: 72.8252,
      categories: 'medical_camp,health,blood_donation',
      rating: 4.7,
      totalEvents: 25,
      successfulEvents: 24,
      verified: true
    }
  })

  const hinduja = await prisma.organization.create({
    data: {
      name: 'Hinduja Hospital',
      type: 'HOSPITAL',
      description: 'World-class healthcare facility in Mahim.',
      email: 'info@hindujahospital.com',
      address: 'Veer Savarkar Marg, Mahim',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0345,
      lng: 72.8398,
      categories: 'medical_camp,health',
      rating: 4.6,
      totalEvents: 18,
      successfulEvents: 16,
      verified: true
    }
  })

  const tcs = await prisma.organization.create({
    data: {
      name: 'TCS Foundation',
      type: 'COMPANY',
      description: 'Corporate Social Responsibility wing of TCS.',
      email: 'csr@tcs.com',
      address: 'Banyan Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1147,
      lng: 72.8711,
      categories: 'education,mentorship,csr',
      rating: 4.4,
      totalEvents: 22,
      successfulEvents: 20,
      verified: true
    }
  })

  const reliance = await prisma.organization.create({
    data: {
      name: 'Reliance Foundation',
      type: 'COMPANY',
      description: 'Philanthropic initiative aiming to create inclusive growth.',
      email: 'contact@reliancefoundation.org',
      address: 'BKC, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0660,
      lng: 72.8645,
      categories: 'health,education,environment',
      rating: 4.5,
      totalEvents: 28,
      successfulEvents: 25,
      verified: true
    }
  })

  const bmc = await prisma.organization.create({
    data: {
      name: 'BMC Ward Office',
      type: 'GOVERNMENT',
      description: 'Brihanmumbai Municipal Corporation regional office.',
      email: 'ward.a@mcgm.gov.in',
      address: 'Fort',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 18.9322,
      lng: 72.8344,
      categories: 'sanitation,road,water',
      rating: 3.8,
      totalEvents: 50,
      successfulEvents: 35,
      verified: true
    }
  })

  const cleanIndia = await prisma.organization.create({
    data: {
      name: 'Clean India Foundation',
      type: 'NGO',
      description: 'Promoting sanitation and cleanliness across urban spaces.',
      email: 'hello@cleanindia.org',
      address: 'Dadar West',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0178,
      lng: 72.8437,
      categories: 'cleanup,sanitation,environment',
      rating: 4.3,
      totalEvents: 25,
      successfulEvents: 22,
      verified: true
    }
  })

  // -----------------------------------------
  // 3. Org Members
  // -----------------------------------------
  await prisma.orgMember.createMany({
    data: [
      { userId: rajeshPatel.id, orgId: hopeFoundation.id, role: 'ADMIN' },
      { userId: sunitaVerma.id, orgId: greenEarth.id, role: 'ADMIN' },
      { userId: amitKumar.id, orgId: dps.id, role: 'ADMIN' },
      { userId: nehaGupta.id, orgId: iitb.id, role: 'ADMIN' },
      { userId: drVikram.id, orgId: lilavati.id, role: 'ADMIN' },
      { userId: arjunMehta.id, orgId: bmc.id, role: 'ADMIN' }
    ]
  })

  // -----------------------------------------
  // 4. Partnership Scores
  // -----------------------------------------
  console.log('Seeding Partnership Scores...')
  
  const scoreData = [
    // Hope Foundation (Great at blood_donation, ok at medical_camp, poor at environment)
    { orgId: hopeFoundation.id, category: 'blood_donation', totalCollaborations: 15, successRate: 0.95, avgRating: 4.9, reliabilityScore: 0.98, responseScore: 0.9, overallScore: 0.94 },
    { orgId: hopeFoundation.id, category: 'medical_camp', totalCollaborations: 25, successRate: 0.88, avgRating: 4.6, reliabilityScore: 0.90, responseScore: 0.85, overallScore: 0.88 },
    { orgId: hopeFoundation.id, category: 'environment', totalCollaborations: 2, successRate: 0.40, avgRating: 3.2, reliabilityScore: 0.50, responseScore: 0.6, overallScore: 0.55 },
    
    // Green Earth Society (Great at environment/tree_plantation)
    { orgId: greenEarth.id, category: 'tree_plantation', totalCollaborations: 18, successRate: 0.92, avgRating: 4.8, reliabilityScore: 0.90, responseScore: 0.88, overallScore: 0.91 },
    { orgId: greenEarth.id, category: 'cleanup', totalCollaborations: 12, successRate: 0.85, avgRating: 4.5, reliabilityScore: 0.88, responseScore: 0.85, overallScore: 0.87 },

    // DPS (Good at education, blood_donation)
    { orgId: dps.id, category: 'education', totalCollaborations: 10, successRate: 0.9, avgRating: 4.5, reliabilityScore: 0.92, responseScore: 0.8, overallScore: 0.89 },
    { orgId: dps.id, category: 'blood_donation', totalCollaborations: 8, successRate: 0.95, avgRating: 4.8, reliabilityScore: 0.95, responseScore: 0.9, overallScore: 0.93 },
    
    // IITB (Excellent at education, innovation)
    { orgId: iitb.id, category: 'education', totalCollaborations: 20, successRate: 0.95, avgRating: 4.9, reliabilityScore: 0.96, responseScore: 0.92, overallScore: 0.95 },
    { orgId: iitb.id, category: 'innovation', totalCollaborations: 12, successRate: 0.98, avgRating: 5.0, reliabilityScore: 0.98, responseScore: 0.95, overallScore: 0.97 },

    // Lilavati (Excellent at medical_camp, blood_donation)
    { orgId: lilavati.id, category: 'medical_camp', totalCollaborations: 15, successRate: 0.96, avgRating: 4.8, reliabilityScore: 0.97, responseScore: 0.95, overallScore: 0.96 },
    { orgId: lilavati.id, category: 'blood_donation', totalCollaborations: 10, successRate: 0.95, avgRating: 4.7, reliabilityScore: 0.95, responseScore: 0.92, overallScore: 0.94 },
    
    // TCS (Good at mentorship)
    { orgId: tcs.id, category: 'mentorship', totalCollaborations: 15, successRate: 0.9, avgRating: 4.5, reliabilityScore: 0.9, responseScore: 0.85, overallScore: 0.88 },
    
    // Clean India (Good at cleanup)
    { orgId: cleanIndia.id, category: 'cleanup', totalCollaborations: 20, successRate: 0.88, avgRating: 4.4, reliabilityScore: 0.85, responseScore: 0.8, overallScore: 0.86 }
  ]

  await prisma.partnershipScore.createMany({
    data: scoreData
  })

  // -----------------------------------------
  // 5. CollabRequests
  // -----------------------------------------
  console.log('Seeding CollabRequests...')

  const request1 = await prisma.collabRequest.create({
    data: {
      title: 'Free Eye Check-up Camp',
      description: 'Looking for partners to organize a free eye check-up camp for underprivileged children.',
      category: 'medical_camp',
      requiredPartners: 'SCHOOL,NGO',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1136,
      lng: 72.8297,
      radiusKm: 15,
      eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'OPEN',
      creatorId: drPriya.id
    }
  })

  const request2 = await prisma.collabRequest.create({
    data: {
      title: 'Mega Blood Donation Drive',
      description: 'We are hosting a massive blood donation drive and need venue and medical partners.',
      category: 'blood_donation',
      requiredPartners: 'SCHOOL,HOSPITAL',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1136,
      lng: 72.8297,
      radiusKm: 10,
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      creatorId: rajeshPatel.id,
      orgId: hopeFoundation.id
    }
  })

  const request3 = await prisma.collabRequest.create({
    data: {
      title: 'Monsoon Tree Plantation Drive',
      description: 'Planting 1000 native saplings. Need student volunteers and venue support.',
      category: 'tree_plantation',
      requiredPartners: 'SCHOOL,COLLEGE',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0596,
      lng: 72.8295,
      radiusKm: 25,
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      creatorId: sunitaVerma.id,
      orgId: greenEarth.id
    }
  })

  const request4 = await prisma.collabRequest.create({
    data: {
      title: 'Career Mentorship Program',
      description: 'IT professionals mentoring final year students for industry readiness.',
      category: 'mentorship',
      requiredPartners: 'COLLEGE',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.1147,
      lng: 72.8711,
      radiusKm: 20,
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      creatorId: nehaGupta.id, // Creating as user
      orgId: tcs.id
    }
  })

  const request5 = await prisma.collabRequest.create({
    data: {
      title: 'Juhu Beach Cleanup Campaign',
      description: 'Post-festival beach cleanup initiative.',
      category: 'cleanup',
      requiredPartners: 'SCHOOL,COLLEGE,COMPANY',
      city: 'Mumbai',
      state: 'Maharashtra',
      lat: 19.0974,
      lng: 72.8264,
      radiusKm: 10,
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      creatorId: rajeshPatel.id,
      orgId: cleanIndia.id
    }
  })

  // -----------------------------------------
  // 6. Civic Issues
  // -----------------------------------------
  console.log('Seeding Civic Issues...')
  
  const issue1 = await prisma.civicIssue.create({
    data: {
      reporterId: ananyaJoshi.id,
      title: 'Garbage Accumulation near Andheri Station',
      description: 'Large pile of uncollected garbage blocking the pedestrian path outside the east side exit.',
      category: 'garbage',
      address: 'Andheri Station East',
      city: 'Mumbai',
      lat: 19.1197,
      lng: 72.8468,
      status: 'OPEN',
      priority: 'HIGH',
      upvotes: 12
    }
  })

  const issue2 = await prisma.civicIssue.create({
    data: {
      reporterId: drPriya.id,
      title: 'Broken Road near Bandra Reclamation',
      description: 'Severe potholes causing traffic jams and risk of accidents.',
      category: 'road',
      address: 'Bandra Reclamation Road',
      city: 'Mumbai',
      lat: 19.0494,
      lng: 72.8252,
      status: 'ASSIGNED',
      priority: 'HIGH',
      department: 'Roads & Traffic',
      upvotes: 45
    }
  })

  const issue3 = await prisma.civicIssue.create({
    data: {
      reporterId: nehaGupta.id,
      title: 'Water Leakage at Powai Pipeline',
      description: 'Continuous drinking water leakage from the main pipeline for the past 2 days.',
      category: 'water',
      address: 'JVLR, Near IIT Bombay',
      city: 'Mumbai',
      lat: 19.1293,
      lng: 72.9080,
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      department: 'Water Supply',
      upvotes: 28
    }
  })

  const issue4 = await prisma.civicIssue.create({
    data: {
      reporterId: amitKumar.id,
      title: 'Damaged Streetlights on Link Road',
      description: 'A 500m stretch of streetlights is not working, making it unsafe at night.',
      category: 'electricity',
      address: 'Malad Link Road',
      city: 'Mumbai',
      lat: 19.1860,
      lng: 72.8350,
      status: 'OPEN',
      priority: 'MEDIUM',
      upvotes: 15
    }
  })

  const issue5 = await prisma.civicIssue.create({
    data: {
      reporterId: rajeshPatel.id,
      title: 'Open Drain near Malad Market',
      description: 'Drain cover is missing, posing a serious hazard to pedestrians.',
      category: 'drainage',
      address: 'Malad West Market',
      city: 'Mumbai',
      lat: 19.1873,
      lng: 72.8402,
      status: 'OPEN',
      priority: 'HIGH',
      upvotes: 33
    }
  })

  const issue6 = await prisma.civicIssue.create({
    data: {
      reporterId: sunitaVerma.id,
      title: 'Overflowing Dustbin at Dadar Station',
      description: 'Public dustbin overflowing onto the street.',
      category: 'garbage',
      address: 'Dadar West Station Road',
      city: 'Mumbai',
      lat: 19.0193,
      lng: 72.8427,
      status: 'RESOLVED',
      priority: 'LOW',
      department: 'Solid Waste Management',
      upvotes: 8
    }
  })

  const issue7 = await prisma.civicIssue.create({
    data: {
      reporterId: ananyaJoshi.id,
      title: 'Pothole on Western Express Highway',
      description: 'Large pothole in the middle lane causing dangerous swerving.',
      category: 'road',
      address: 'WEH, Near Goregaon',
      city: 'Mumbai',
      lat: 19.1645,
      lng: 72.8596,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      department: 'Roads Department',
      upvotes: 56
    }
  })

  const issue8 = await prisma.civicIssue.create({
    data: {
      reporterId: drVikram.id,
      title: 'Sewage Overflow in Andheri East',
      description: 'Sewage water flooding the residential lane near the hospital.',
      category: 'sanitation',
      address: 'Andheri East, near JB Nagar',
      city: 'Mumbai',
      lat: 19.1085,
      lng: 72.8631,
      status: 'ASSIGNED',
      priority: 'CRITICAL',
      department: 'Sewerage Operations',
      upvotes: 42
    }
  })

  // -----------------------------------------
  // 7. Issue Updates
  // -----------------------------------------
  await prisma.issueUpdate.createMany({
    data: [
      {
        issueId: issue2.id,
        status: 'ASSIGNED',
        comment: 'Issue verified. Contractor has been assigned to fix the road segment.',
        updatedBy: arjunMehta.id
      },
      {
        issueId: issue3.id,
        status: 'ASSIGNED',
        comment: 'Water department notified.',
        updatedBy: arjunMehta.id
      },
      {
        issueId: issue3.id,
        status: 'IN_PROGRESS',
        comment: 'Team is on site to fix the leakage.',
        updatedBy: arjunMehta.id
      },
      {
        issueId: issue6.id,
        status: 'RESOLVED',
        comment: 'Garbage cleared and dustbin emptied.',
        updatedBy: arjunMehta.id
      },
      {
        issueId: issue7.id,
        status: 'IN_PROGRESS',
        comment: 'Temporary leveling done. Permanent fix scheduled for tonight.',
        updatedBy: arjunMehta.id
      },
      {
        issueId: issue8.id,
        status: 'ASSIGNED',
        comment: 'Sewer cleaning machine deployed.',
        updatedBy: arjunMehta.id
      }
    ]
  })

  // -----------------------------------------
  // 8. Sample Partnership (so My Partnerships isn't empty)
  // -----------------------------------------
  console.log('Seeding sample Partnership...')

  await prisma.collabResponse.create({
    data: {
      requestId: request3.id,
      orgId: dps.id,
      orgName: dps.name,
      message: 'Happy to host student volunteers for the plantation drive.',
      status: 'ACCEPTED',
    },
  })

  const samplePartnership = await prisma.partnership.create({
    data: {
      requestId: request3.id,
      status: 'ACTIVE',
      startDate: new Date(),
    },
  })

  await prisma.partnershipOrg.createMany({
    data: [
      { partnershipId: samplePartnership.id, orgId: greenEarth.id, role: 'HOST' },
      { partnershipId: samplePartnership.id, orgId: dps.id, role: 'PARTNER' },
    ],
  })

  await prisma.task.createMany({
    data: [
      {
        partnershipId: samplePartnership.id,
        title: 'Confirm venue & sapling delivery',
        status: 'DONE',
        priority: 'HIGH',
        aiGenerated: true,
      },
      {
        partnershipId: samplePartnership.id,
        title: 'Recruit 40 student volunteers',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        aiGenerated: true,
      },
      {
        partnershipId: samplePartnership.id,
        title: 'Prepare planting layout map',
        status: 'TODO',
        priority: 'MEDIUM',
        aiGenerated: true,
      },
    ],
  })

  await prisma.workspaceMessage.create({
    data: {
      partnershipId: samplePartnership.id,
      senderName: 'SocialBridge AI',
      senderRole: 'SYSTEM',
      content:
        'Welcome to the Monsoon Tree Plantation Drive workspace. DPS and Green Earth Society are partnered. Use AI Quick Actions to generate more tasks or a proposal.',
    },
  })

  await prisma.document.create({
    data: {
      partnershipId: samplePartnership.id,
      title: 'Plantation Kickoff Notes',
      content:
        '## Goals\n- Plant 1000 native saplings\n- Engage school volunteers\n- Track survival rate for 30 days\n\n## Next steps\n1. Finalize site map\n2. Confirm water access\n3. Share volunteer briefing',
      type: 'note',
      aiGenerated: false,
    },
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
