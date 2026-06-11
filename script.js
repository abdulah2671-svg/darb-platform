document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.app-section');
    const pageTitle = document.getElementById('page-title');
    const pageDesc = document.getElementById('page-desc');

    const pageInfo = {
        'cv-engineer': { title: 'مرحباً بكم في منصة درب', desc: 'قم بتخصيص سيرتك الذاتية لتتطابق مع متطلبات الوظيفة بدقة عالية' },
        'interview-coach': { title: 'مُدرب المقابلات (Interview Coach)', desc: 'شاهد محاكاة مقابلة مهنية تساعدك على فهم أسلوب الإجابة المنظم' },
        'company-intelligence': { title: 'مُحلل الشركات (Company Analyzer)', desc: 'احصل على ملخص تحضيري موضوعي حول الشركة والدور المستهدف' },
        'career-library': { title: 'المكتبة المهنية (Career Library)', desc: 'حمّل ملفات تقنية ومهنية مختارة لدعم جاهزيتك الوظيفية' },
        'golden-tips': { title: 'نصائح ذهبية', desc: 'نصائح عملية مختارة لمساعدتك في مسيرتك المهنية' },
        'job-platforms': { title: 'منصات توظيف', desc: 'اضغط على أي منصة للانتقال إليها مباشرةً' },
        'influencers-section': { title: 'حسابات المؤثرين في التواصل الاجتماعي', desc: 'حسابات مختارة لأبرز المؤثرين في التقنية والتوظيف والتطوير المهني' }
    };

    // --- Mobile Sidebar Toggle ---
    const sidebar = document.querySelector('.sidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
        hamburgerBtn.querySelector('i').className = 'fa-solid fa-xmark';
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
        hamburgerBtn.querySelector('i').className = 'fa-solid fa-bars';
    }
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => {
                sec.classList.remove('active-section');
                sec.classList.remove('fade-in'); 
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                setTimeout(() => targetSection.classList.add('fade-in'), 10);
            }

            if (pageTitle && pageInfo[targetId]) {
                pageTitle.textContent = pageInfo[targetId].title;
                pageDesc.textContent = pageInfo[targetId].desc;
            }

            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) closeSidebar();
        });
    });

    // --- Utility: Toast Notification ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        if(type === 'info') icon = 'fa-info-circle';

        toast.innerHTML = `
            <i class="fa-solid ${icon} toast-icon"></i>
            <div style="font-weight: 500; font-size: 14px;">${message}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function normalizeText(text) {
        return (text || '').toLowerCase().replace(/[^\u0600-\u06FFa-z0-9+#.\s]/gi, ' ').replace(/\s+/g, ' ').trim();
    }

    function extractKeywords(text) {
        const stopWords = new Set(['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'ضمن', 'لدى', 'على', 'أن', 'أو', 'كما', 'كل', 'بين', 'and', 'or', 'the', 'for', 'with', 'to', 'of', 'in', 'a', 'an', 'is', 'are', 'as', 'by']);
        const words = normalizeText(text).split(' ').filter(word => word.length > 2 && !stopWords.has(word));
        const frequency = {};
        words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
        return Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([word]) => word);
    }

    function extractWeightedKeywords(jobTitle, jobDescription) {
        const titleKeywords = extractKeywords(jobTitle);
        const descriptionKeywords = extractKeywords(jobDescription);
        const technicalKeywords = extractTechnicalKeywords(`${jobTitle} ${jobDescription}`);
        const weighted = {};
        titleKeywords.forEach(keyword => weighted[keyword] = (weighted[keyword] || 0) + 4);
        descriptionKeywords.forEach(keyword => weighted[keyword] = (weighted[keyword] || 0) + 1);
        technicalKeywords.forEach(keyword => weighted[keyword] = (weighted[keyword] || 0) + 3);
        return Object.entries(weighted).sort((a, b) => b[1] - a[1]).slice(0, 26).map(([word]) => word);
    }

    function calculateMatch(cv, jd, keywords) {
        if (!keywords.length) return 0;
        const cvText = normalizeText(cv);
        const matched = keywords.filter(keyword => cvText.includes(keyword));
        return Math.round((matched.length / keywords.length) * 100);
    }

    function detectSections(cv) {
        const lines = cv.split('\n').map(line => line.trim()).filter(Boolean);
        const sections = [];
        let current = { title: 'محتوى السيرة', lines: [] };
        lines.forEach(line => {
            const isHeading = line.length <= 45 && /^(الملخص|المهارات|الخبرات|التعليم|الشهادات|summary|skills|experience|education|certifications)/i.test(line);
            if (isHeading) {
                if (current.lines.length) sections.push(current);
                current = { title: line, lines: [] };
            } else {
                current.lines.push(line);
            }
        });
        if (current.lines.length) sections.push(current);
        return sections;
    }

    function strengthenLine(line, keywords) {
        const cleanLine = line.replace(/\s+/g, ' ').trim();
        const lineText = normalizeText(cleanLine);
        const relevant = keywords.filter(keyword => !lineText.includes(keyword)).slice(0, 2);
        if (!relevant.length) return cleanLine;
        return `${cleanLine} while applying ${relevant.join(' and ')} to support the target technical role.`;
    }

    function extractTechnicalKeywords(text) {
        const source = normalizeText(text);
        const technicalTerms = [
            'networking', 'network', 'routing', 'switching', 'tcp/ip', 'dhcp', 'dns', 'firewall', 'vpn', 'lan', 'wan',
            'cybersecurity', 'security', 'siem', 'soc', 'incident response', 'vulnerability', 'penetration testing',
            'cloud', 'aws', 'azure', 'gcp', 'devops', 'docker', 'kubernetes', 'linux', 'windows server',
            'programming', 'javascript', 'python', 'java', 'sql', 'database', 'api', 'frontend', 'backend',
            'data analysis', 'power bi', 'excel', 'machine learning', 'artificial intelligence', 'it support',
            'help desk', 'technical support', 'systems administration', 'monitoring', 'troubleshooting'
        ];
        return technicalTerms.filter(term => source.includes(normalizeText(term)));
    }

    function findContactInfo(cv) {
        const email = cv.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
        const phone = cv.match(/(?:\+?\d[\d\s\-()]{7,}\d)/)?.[0] || '';
        const lines = cv.split('\n').map(line => line.trim()).filter(Boolean);
        const name = lines.find(line => {
            const clean = line.replace(/[-|•]/g, ' ').trim();
            return clean.length >= 5 && clean.length <= 45 && !clean.includes('@') && !/\d{5,}/.test(clean) && !/^(career|objective|summary|education|experience|skills|courses|languages|reference)/i.test(clean);
        }) || '';
        return { name, email, phone };
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function cleanResumeLines(lines, limit = 8) {
        const seen = new Set();
        const expanded = [];
        lines.forEach(line => {
            const cleaned = line.replace(/\s+/g, ' ').replace(/^[-•*]\s*/, '').trim();
            if (cleaned.length > 120) {
                cleaned.split(/(?<=\.)\s+|\s{2,}/).forEach(part => {
                    const p = part.replace(/^[-•*]\s*/, '').trim();
                    if (p.length > 2) expanded.push(p);
                });
            } else if (cleaned.length > 2) {
                expanded.push(cleaned);
            }
        });
        return expanded
            .filter(line => line.length < 200)
            .filter(line => {
                const key = normalizeText(line);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, limit);
    }

    function collectSectionLines(cv, labels, fallbackKeywords = []) {
        const lines = cv.split('\n').map(line => line.trim()).filter(Boolean);
        const normalizedLabels = labels.map(label => normalizeText(label));
        const headingPattern = /^(career objective|objective|summary|education|experience|experiences|courses|certifications|skills|languages|reference|الملخص|المهارات|الخبرات|التعليم|الشهادات|الدورات)/i;
        const collected = [];
        let active = false;
        lines.forEach(line => {
            const normalized = normalizeText(line);
            const isTarget = normalizedLabels.some(label => normalized.includes(label));
            const isHeading = headingPattern.test(line);
            if (isTarget) {
                active = true;
                return;
            }
            if (active && isHeading) {
                active = false;
            }
            if (active && line.length > 2) {
                collected.push(line);
            }
        });
        if (collected.length) return collected.slice(0, 8);
        return lines.filter(line => {
            const normalized = normalizeText(line);
            return fallbackKeywords.some(keyword => normalized.includes(normalizeText(keyword)));
        }).slice(0, 8);
    }

    function selectRelevantLines(cv, keywords, limit = 8) {
        const lines = cv.split('\n').map(line => line.trim()).filter(line => line.length > 12);
        const scored = lines.map(line => {
            const text = normalizeText(line);
            const score = keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
            return { line, score };
        });
        return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(item => item.line);
    }

    function formatBullet(line, jobTitle, skills) {
        const text = line.replace(/\s+/g, ' ').replace(/^[-•]\s*/, '').trim();
        const skill = skills.find(item => !normalizeText(text).includes(normalizeText(item))) || skills[0] || 'technical requirements';
        if (/^(delivered|participated|developed|configured|managed|supported|analyzed|built|created|implemented|troubleshot|monitored)/i.test(text)) {
            return `${text}.`;
        }
        return `Applied ${skill} in ${jobTitle} related tasks by ${text.charAt(0).toLowerCase()}${text.slice(1)}.`;
    }

    function splitUserList(value) {
        if (!value) return [];
        const raw = String(value)
            .replace(/–|—/g, '\n')
            .replace(/([A-Za-z\u0600-\u06FF]{3,}):\s/g, '\n$1: ')
            .split(/\n|،|,|;/);
        return cleanResumeLines(raw, 20);
    }

    function readUserInfo() {
        return {
            surveyLanguage: document.querySelector('.survey-lang-btn.active')?.dataset.surveyLang || 'en',
            fullName: document.getElementById('user-full-name')?.value.trim() || '',
            email: document.getElementById('user-email')?.value.trim() || '',
            phone: document.getElementById('user-phone')?.value.trim() || '',
            region: document.getElementById('user-region')?.value.trim() || '',
            college: document.getElementById('user-college')?.value.trim() || '',
            major: document.getElementById('user-major')?.value.trim() || '',
            gpa: document.getElementById('user-gpa')?.value.trim() || '',
            linkedin: document.getElementById('user-linkedin')?.value.trim() || '',
            company: document.getElementById('company-name')?.value.trim() || '',
            department: document.getElementById('target-department')?.value.trim() || '',
            jobDetails: document.getElementById('target-job-details')?.value.trim() || '',
            careerObjective: document.getElementById('cv-career-objective')?.value.trim() || '',
            educationText: document.getElementById('cv-education')?.value.trim() || '',
            experience: document.getElementById('user-experience')?.value.trim() || '',
            courses: document.getElementById('user-courses')?.value.trim() || '',
            skills: document.getElementById('user-skills')?.value.trim() || '',
            languages: document.getElementById('cv-languages')?.value.trim() || '',
            reference: document.getElementById('cv-reference')?.value.trim() || ''
        };
    }

    function createResumeData(cv, jobTitle, topKeywords, missingKeywords, userInfo = {}) {
        const contact = findContactInfo(cv);
        const primarySkills = topKeywords.slice(0, 12);
        const userSkills = splitUserList(userInfo.skills);
        const userCourses = splitUserList(userInfo.courses);
        const userExperience = splitUserList(userInfo.experience);
        const userEducation = splitUserList(userInfo.educationText);
        const userLanguages = splitUserList(userInfo.languages);
        const reference = splitUserList(userInfo.reference);
        const technicalSkills = cleanResumeLines(userSkills.length ? userSkills : extractTechnicalKeywords(`${cv} ${jobTitle} ${userInfo.jobDetails}`), 9);
        const extractedEducation = cleanResumeLines(collectSectionLines(cv, ['education', 'التعليم'], ['college', 'university', 'diploma', 'bachelor', 'gpa', 'جامعة', 'كلية', 'دبلوم']), 4);
        let education = extractedEducation;
        if (userEducation.length) {
            education = userEducation;
        } else if (userInfo.college || userInfo.major || userInfo.gpa) {
            education = [
                [userInfo.major, userInfo.college].filter(Boolean).join(' | '),
                userInfo.gpa ? `GPA: ${userInfo.gpa}` : ''
            ].filter(Boolean);
        }
        const courses = userCourses.length ? userCourses.slice(0, 5) : cleanResumeLines(collectSectionLines(cv, ['courses', 'certifications', 'الدورات', 'الشهادات'], ['course', 'certificate', 'workshop', 'bootcamp', 'fundamentals']), 5);
        const languages = cleanResumeLines(collectSectionLines(cv, ['languages', 'اللغات'], ['arabic', 'english', 'عربي', 'انجليزي']), 4);
        const rawExperience = cleanResumeLines(userExperience.length ? userExperience : collectSectionLines(cv, ['experience', 'experiences', 'الخبرات'], ['internship', 'training', 'work', 'project', 'company', 'تدريب', 'عمل']), 4);
        const experienceBullets = rawExperience.slice(0, 4);
        return {
            language: userInfo.surveyLanguage || 'en',
            name: (userInfo.fullName || contact.name || 'RESUME').toUpperCase(),
            role: jobTitle,
            contact: [
                userInfo.email || contact.email,
                userInfo.phone || contact.phone,
                userInfo.region,
                userInfo.linkedin ? `LinkedIn: ${userInfo.linkedin}` : ''
            ].filter(Boolean).join(' | '),
            objective: userInfo.careerObjective,
            education,
            experience: experienceBullets,
            courses: courses.slice(0, 4),
            technicalSkills: technicalSkills.slice(0, 8),
            languages: userLanguages.length ? userLanguages.slice(0, 3) : languages.slice(0, 3),
            reference: reference.length ? reference.slice(0, 3) : [],
            notes: missingKeywords.length ? missingKeywords.slice(0, 3).map(keyword => `Add a clear technical example proving experience in: ${keyword}`) : ['Main technical keywords are covered.']
        };
    }

    function getResumeSectionLabels(language = 'en') {
        if (language === 'ar') {
            return {
                objective: 'الهدف الوظيفي',
                education: 'المؤهل التعليمي',
                experience: 'الخبرات المهنية',
                courses: 'الدورات التدريبية',
                skills: 'المهارات',
                languages: 'اللغات',
                reference: 'المراجع'
            };
        }
        return {
            objective: 'CAREER OBJECTIVE',
            education: 'EDUCATION',
            experience: 'EXPERIENCES',
            courses: 'COURSES',
            skills: 'SKILLS',
            languages: 'LANGUAGES',
            reference: 'REFERENCE'
        };
    }

    function buildResumeText(data) {
        const labels = getResumeSectionLabels(data.language);
        const sections = [
            [labels.objective, data.objective],
            [labels.education, data.education],
            [labels.experience, data.experience],
            [labels.courses, data.courses],
            [labels.skills, data.technicalSkills],
            [labels.languages, data.languages],
            [labels.reference, data.reference]
        ].filter(([, content]) => Array.isArray(content) ? content.length : Boolean(content));
        return [`${data.name}\n${data.role}\n${data.contact}`, ...sections.map(([title, content]) => {
            const body = Array.isArray(content) ? content.map(item => `- ${item}`).join('\n') : content;
            return `${title}\n${body}`;
        })].join('\n\n');
    }

    function buildResumeHtml(data) {
        const labels = getResumeSectionLabels(data.language);
        const section = (title, content) => `<section class="resume-section"><h4>${escapeHtml(title)}</h4>${content}</section>`;
        const list = items => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
        const optionalSection = (title, content) => {
            if (Array.isArray(content)) return content.length ? section(title, list(content)) : '';
            return content ? section(title, `<p>${escapeHtml(content)}</p>`) : '';
        };
        return `<div class="${data.language === 'ar' ? 'resume-arabic' : ''}">
<div class="resume-name">${escapeHtml(data.name)}</div>
<div class="resume-role">${escapeHtml(data.role)}</div>
<div class="resume-contact">${escapeHtml(data.contact)}</div>
${optionalSection(labels.objective, data.objective)}
${optionalSection(labels.education, data.education)}
${optionalSection(labels.experience, data.experience)}
${optionalSection(labels.courses, data.courses)}
${optionalSection(labels.skills, data.technicalSkills)}
${optionalSection(labels.languages, data.languages)}
${optionalSection(labels.reference, data.reference)}</div>`;
    }

    function buildAtsTemplate(cv, jobTitle, topKeywords, missingKeywords, userInfo = {}) {
        return buildResumeText(createResumeData(cv, jobTitle, topKeywords, missingKeywords, userInfo));
    }

    function buildEnhancedCv(cv, jd, jobTitle, userInfo = {}) {
        const combinedJobDescription = `${jd}\n${userInfo.jobDetails || ''}`;
        const keywords = extractWeightedKeywords(jobTitle, combinedJobDescription);
        const matchedScore = calculateMatch(cv, combinedJobDescription, keywords);
        const missingKeywords = keywords.filter(keyword => !normalizeText(cv).includes(keyword)).slice(0, 8);
        const topKeywords = keywords.slice(0, 10);
        const resumeData = createResumeData(cv, jobTitle, topKeywords, missingKeywords, userInfo);
        const enhancedCv = buildResumeText(resumeData);

        const atsReport = `ATS TECHNICAL MATCH REPORT

Estimated Match Score: ${matchedScore}%

Target Technical Role:
- ${jobTitle || 'Not provided'}

High-Priority Keywords Used:
${topKeywords.map(keyword => `- ${keyword}`).join('\n') || '- Add a longer technical job description to extract stronger keywords.'}

Weak or Missing Keywords:
${missingKeywords.length ? missingKeywords.map(keyword => `- ${keyword}`).join('\n') : '- No major keyword gaps detected.'}

Quality Improvements Applied:
- Rebuilt the resume into a clean ATS-friendly technical template.
- Mapped extracted education, courses, languages, and technical content into clear sections.
- Prioritized the target job title and job description over unrelated content.
- Converted weak/raw lines into stronger technical responsibility bullets.
- Kept the structure simple, readable, and suitable for technical roles.`;

        return { enhancedCv, atsReport, resumeData };
    }

    const interviewScenarios = [
        ['ما نقاط قوتك؟', 'الالتزام، سرعة التعلم، والعمل بروح الفريق'],
        ['ما نقطة تحتاج إلى تطويرها؟', 'أعمل على زيادة خبرتي العملية من خلال المشاريع والتدريب المستمر'],
        ['كيف تتعامل مع ضغط العمل؟', 'أرتب الأولويات وأركز على المهام الأكثر أهمية أولاً'],
        ['ما الفرق بين TCP و UDP؟', 'TCP موثوق ويستخدم التحقق من التسليم، بينما UDP أسرع ولا يضمن التسليم'],
        ['ما وظيفة DHCP؟', 'توزيع عناوين IP تلقائياً على الأجهزة'],
        ['ما المقصود بـ VLAN؟', 'تقسيم الشبكة منطقياً لتحسين الإدارة والأمان'],
        ['كيف تتحقق من مشكلة اتصال بالشبكة؟', 'أبدأ بفحص الطبقة الفيزيائية ثم إعدادات IP واختبارات Ping وTraceroute'],
        ['ما هو DNS؟', 'خدمة تحول أسماء النطاقات إلى عناوين IP'],
        ['حدثني عن مشروع شبكات عملت عليه', 'قمت بإعداد شبكة محلية وربط الأجهزة وتطبيق سياسات أساسية للأمان'],
        ['كيف تتعامل مع مستخدم غاضب؟', 'أستمع للمشكلة بهدوء وأشرح خطوات الحل بوضوح'],
        ['ما أول خطوة عند تعطل جهاز مستخدم؟', 'جمع المعلومات وتشخيص السبب قبل البدء بالحل'],
        ['ما الفرق بين Hardware و Software؟', 'الأول مكونات مادية والثاني البرامج والأنظمة'],
        ['كيف تعالج بطء الحاسب؟', 'فحص الموارد والبرامج والخدمات وتحديث النظام عند الحاجة'],
        ['ما هو نظام التذاكر؟', 'آلية لتوثيق ومتابعة طلبات الدعم الفني'],
        ['اذكر موقفاً حليت فيه مشكلة تقنية', 'حللت سبب تعطل برنامج بسبب صلاحيات المستخدم وتمت معالجة المشكلة'],
        ['ما المقصود بعرض النطاق الترددي؟', 'كمية البيانات التي يمكن نقلها خلال فترة زمنية محددة'],
        ['ما الفرق بين الإشارة التناظرية والرقمية؟', 'التناظرية مستمرة والرقمية تعتمد على قيم منفصلة'],
        ['ما أهمية الأبراج في شبكات الاتصالات؟', 'توفير التغطية ونقل الإشارات للمستخدمين'],
        ['كيف تؤثر المسافة على جودة الإشارة؟', 'كلما زادت المسافة زاد التوهين وضعفت الإشارة'],
        ['ما المقصود بالتوهين؟', 'انخفاض قوة الإشارة أثناء انتقالها'],
        ['حدثني عن تقنية اتصالات حديثة', 'تقنية الجيل الخامس 5G توفر سرعات أعلى وزمن استجابة أقل'],
        ['ما الفرق بين الشبكة المحلية LAN والشبكة الواسعة WAN؟', 'LAN تغطي منطقة جغرافية محدودة كالمبنى، بينما WAN تربط مواقع متعددة عبر مسافات بعيدة'],
        ['ما وظيفة جدار الحماية Firewall؟', 'تصفية حركة البيانات ومنع الوصول غير المصرح به للشبكة'],
        ['ما الفرق بين Hub وSwitch؟', 'Hub يرسل البيانات لجميع الأجهزة، بينما Switch يرسلها للجهاز المحدد فقط'],
        ['كيف تتحقق من عنوان IP الخاص بجهازك؟', 'باستخدام أمر ipconfig في Windows أو ifconfig في Linux'],
        ['ما المقصود بـ Subnet Mask؟', 'يحدد الجزء الخاص بالشبكة والجزء الخاص بالأجهزة في عنوان IP'],
        ['ما وظيفة بروتوكول HTTP؟', 'نقل صفحات الويب بين الخادم والمتصفح'],
        ['ما الفرق بين HTTP وHTTPS؟', 'HTTPS مشفر ويستخدم SSL/TLS لتأمين البيانات'],
        ['ما المقصود بعنوان MAC؟', 'عنوان فيزيائي فريد لكل بطاقة شبكة يستخدم للتعرف على الأجهزة في الشبكة المحلية'],
        ['كيف يعمل بروتوكول ARP؟', 'يربط عنوان IP بعنوان MAC في الشبكة المحلية'],
        ['ما المقصود بـ NAT؟', 'تقنية تسمح لأجهزة متعددة بمشاركة عنوان IP واحد للوصول للإنترنت'],
        ['ما وظيفة بروتوكول ICMP؟', 'إرسال رسائل التشخيص والتحقق من الاتصال مثل أمر Ping'],
        ['ما الفرق بين الكابل المستقيم والمتقاطع؟', 'المستقيم يربط أجهزة مختلفة كالحاسب بالسويتش، والمتقاطع يربط أجهزة متماثلة'],
        ['ما المقصود بـ Default Gateway؟', 'عنوان الجهاز الذي يُحوّل حركة البيانات خارج الشبكة المحلية للإنترنت'],
        ['كيف تشخص مشكلة لا يوجد اتصال بالإنترنت؟', 'أتحقق من الاتصال المادي ثم IP وGateway وDNS ثم أستخدم Ping وTraceroute للتشخيص'],
        ['ما المقصود بـ QoS؟', 'آلية لتحديد أولويات حركة البيانات في الشبكة لضمان جودة الخدمة'],
        ['ما وظيفة بروتوكول FTP؟', 'نقل الملفات بين الأجهزة عبر الشبكة'],
        ['ما الفرق بين الأمن السيبراني وأمن الشبكات؟', 'أمن الشبكات يركز على حماية البنية التحتية للشبكة، والأمن السيبراني أشمل ويغطي كل الأصول الرقمية'],
        ['ما المقصود بهجوم DoS؟', 'إغراق الخادم بطلبات زائفة لتعطيل الخدمة'],
        ['ما وظيفة VPN؟', 'إنشاء اتصال مشفر آمن عبر الشبكة العامة'],
        ['ما الفرق بين الـ Router والـ Switch؟', 'Switch يعمل في طبقة البيانات ويوجه داخل الشبكة، Router يعمل في طبقة الشبكة ويوجه بين شبكات مختلفة'],
        ['ما المقصود بـ Bandwidth؟', 'الحد الأقصى لكمية البيانات التي يمكن نقلها في وحدة زمنية'],
        ['كيف تتعامل مع انقطاع الشبكة عن قسم كامل؟', 'أتحقق من الـ Switch والكابلات والاتصال بالـ Router وأعيد تشغيل المكوّن المعطل إن لزم'],
        ['ما المقصود بـ Latency؟', 'الوقت المستغرق لنقل البيانات من نقطة لأخرى في الشبكة'],
        ['ما وظيفة بروتوكول SNMP؟', 'مراقبة وإدارة أجهزة الشبكة عن بُعد'],
        ['كيف تحمي شبكة لاسلكية؟', 'باستخدام تشفير WPA3 وكلمة مرور قوية وإخفاء SSID وتفعيل MAC Filtering'],
        ['ما المقصود بـ Packet Loss؟', 'ضياع بعض حزم البيانات أثناء النقل مما يؤثر على جودة الاتصال'],
        ['ما الفرق بين IPv4 وIPv6؟', 'IPv4 يستخدم 32 بت وأصبح ناضباً، IPv6 يستخدم 128 بت ويوفر عناوين أكثر بكثير'],
        ['ما المقصود بـ OSPF؟', 'بروتوكول توجيه ديناميكي يختار أفضل مسار بناءً على التكلفة في الشبكات الكبيرة'],
        ['كيف تتعامل مع خطأ IP Conflict؟', 'أحدد الجهازين اللذين يستخدمان نفس الـ IP وأغيّر أحدهما أو أعيد ضبط DHCP']
    ];
    let currentInterviewScenario = [];

    function shuffleInterviewScenarios() {
        const scenarios = [...interviewScenarios];
        for (let index = scenarios.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const temp = scenarios[index];
            scenarios[index] = scenarios[randomIndex];
            scenarios[randomIndex] = temp;
        }
        return scenarios;
    }

    function buildMixedInterviewScenario() {
        const professionalSignals = ['عرّفنا', 'لماذا اخترت', 'إنجاز', 'اللغة الإنجليزية', 'نقطة قوة', 'نقطة ضعف', 'وين تشوف نفسك', 'ضغط', 'لماذا نختارك', 'ملاحظة', 'يخليك تستمر', 'فريق', 'احترافيتك', 'تختم مقابلة', 'رغبتك في العمل'];
        const professionalScenarios = interviewScenarios.filter(([question]) => professionalSignals.some(signal => question.includes(signal)));
        const technicalScenarios = interviewScenarios.filter(([question]) => !professionalSignals.some(signal => question.includes(signal)));
        const selectedScenarios = [
            ...shuffleInterviewScenarios().filter(item => professionalScenarios.includes(item)).slice(0, 5),
            ...shuffleInterviewScenarios().filter(item => technicalScenarios.includes(item)).slice(0, 5)
        ];
        return selectedScenarios.sort(() => Math.random() - 0.5);
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function playInterviewScenario() {
        addMessage('أ. نورة - مسؤولة التوظيف: السلام عليكم، أهلًا عبدالله. شكرًا لحضورك اليوم، بنبدأ مقابلة لوظيفة فني دعم فني وشبكات.', 'ai');
        await wait(2600);
        addMessage('عبدالله - المرشح: وعليكم السلام ورحمة الله وبركاته، أهلًا أستاذة نورة. أشكركم على إتاحة الفرصة، ويسعدني أكون معكم اليوم.', 'user');
        await wait(3200);

        for (let index = 0; index < currentInterviewScenario.length; index += 1) {
            const [question, answer] = currentInterviewScenario[index];
            let loader = addTypingIndicator();
            await wait(1700);
            loader.remove();
            addMessage(`أ. نورة - مسؤولة التوظيف: ${question}`, 'ai');

            await wait(60000);
            loader = addTypingIndicator();
            await wait(2800);
            loader.remove();
            addMessage(`عبدالله - المرشح: ${answer}`, 'user');
            await wait(2400);
        }

        addMessage('أ. نورة - مسؤولة التوظيف: يعطيك العافية عبدالله، إجاباتك كانت واضحة. بنراجع نتائج المقابلات ونتواصل معك قريبًا بإذن الله.', 'ai');
        await wait(2600);
        addMessage('عبدالله - المرشح: الله يعافيك أستاذة نورة، أشكركم على وقتكم وعلى المقابلة. أتمنى أكون مناسبًا للفريق، وبانتظار تواصلكم.', 'user');
        interviewActive = false;
        if (startInterviewBtn) {
            startInterviewBtn.style.display = 'inline-flex';
            startInterviewBtn.disabled = false;
        }
    }

    function buildCompanyReport(name, industry, department = '', jobDetails = '') {
        const industryKeywords = extractKeywords(`${industry} ${department} ${jobDetails}`).slice(0, 6);
        return `ملخص تحضيري مهني عن ${name}
المجال: ${industry}
القسم المستهدف: ${department || 'غير محدد'}

1. نظرة عامة
- يُنصح بدراسة طبيعة عمل ${name} في مجال ${industry} من خلال مصادرها الرسمية، وصفحاتها المهنية، وإعلاناتها الوظيفية.
- اربط إجاباتك بمتطلبات القسم المستهدف${department ? ` (${department})` : ''} وبالمهام المذكورة في إعلان الوظيفة.
- حضّر أمثلة عملية توضّح فهمك لطبيعة الدور وقدرتك على الإسهام في تحسين جودة العمل.

2. مهارات يُنصح بإبرازها
${(industryKeywords.length ? industryKeywords : ['التواصل', 'حل المشكلات', 'تحليل البيانات', 'إدارة الوقت']).map(item => `- ${item}`).join('\n')}

3. أسئلة مقابلة متوقعة
- لماذا اخترت ${name} تحديدًا؟
- كيف يمكن أن تضيف قيمة في مجال ${industry} خلال أول 90 يومًا؟
- تحدث عن موقف استخدمت فيه مهارة تحليل أو تنظيم لحل مشكلة.
- كيف تتعامل مع ضغط العمل وتغيّر الأولويات؟

4. خطة استعداد سريعة
- اقرأ عن منتجات أو خدمات ${name} ومجال عملها.
- حضّر 3 أمثلة بصيغة STAR: الموقف، المهمة، الإجراء، النتيجة.
- اربط خبراتك مباشرة بمتطلبات الدور المستهدف.
${jobDetails ? '- راجع الوصف الوظيفي المدخل واستخرج منه 5 كلمات مفتاحية لاستخدامها في المقابلة والسيرة.' : '- أضف وصف إعلان الشركة للحصول على تحليل أدق للمهارات والكلمات المفتاحية.'}

5. نقاط يجب سؤال الشركة عنها
- ما مؤشرات النجاح في هذا الدور؟
- ما أكبر تحديات الفريق حاليًا؟
- ما فرص التدريب والتطور المهني؟`;
    }

    async function extractPdfText(file) {
        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const buffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            pages.push(content.items.map(item => item.str).join(' '));
        }
        return pages.join('\n\n').trim();
    }

    async function extractWordText(file) {
        if (file.name.toLowerCase().endsWith('.doc')) {
            throw new Error('صيغة DOC القديمة غير مدعومة في المتصفح. الرجاء تحويل الملف إلى DOCX أو PDF.');
        }
        const buffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
        return result.value.trim();
    }

    async function extractCvText(file) {
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.pdf')) return extractPdfText(file);
        if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) return extractWordText(file);
        throw new Error('الرجاء رفع ملف PDF أو Word فقط.');
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function buildPrintableResumeDocument(resumeHtml, title) {
        const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; direction: ltr; text-align: left; color: #111827; background: #f3f4f6; margin: 0; }
        .page { background: #fff; width: 794px; min-height: 1123px; margin: 24px auto; padding: 44px 48px; box-sizing: border-box; overflow: visible; }
        .actions { margin-bottom: 20px; }
        button { background: #2563eb; color: white; border: none; border-radius: 8px; padding: 10px 16px; cursor: pointer; font-family: inherit; }
        .resume-name { font-size: 24px; font-weight: 800; text-align: center; letter-spacing: 0.5px; margin-bottom: 3px; overflow-wrap: anywhere; }
        .resume-role { font-size: 14px; font-weight: 700; text-align: center; color: #374151; margin-bottom: 5px; overflow-wrap: anywhere; }
        .resume-contact { font-size: 11px; text-align: center; color: #4b5563; padding-bottom: 9px; border-bottom: 2px solid #111827; margin-bottom: 12px; overflow-wrap: anywhere; }
        .resume-section { margin-top: 12px; break-inside: avoid; page-break-inside: avoid; }
        .resume-section h4 { display: block; font-size: 13px; font-weight: 800; color: #111827; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin: 0 0 7px; letter-spacing: 0.4px; line-height: 1.2; }
        .resume-section p { font-size: 12.5px; line-height: 1.5; margin: 0; overflow-wrap: anywhere; }
        .resume-section ul { margin: 0; padding-left: 18px; }
        .resume-section li { font-size: 12.5px; line-height: 1.45; margin-bottom: 3px; overflow-wrap: anywhere; }
        .resume-job-line { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
        @media print { body { background: #fff; } .actions { display: none; } .page { width: auto; min-height: auto; margin: 0; padding: 0; } }
    </style>
</head>
<body>
    <div class="actions page">
        <button onclick="window.print()">حفظ كملف PDF</button>
    </div>
    <main class="page">${resumeHtml}</main>
</body>
</html>`;
        return html;
    }

    function exportAsPdf(text, originalName) {
        const data = currentResumeData || createResumeData(text, 'Technical Role', extractKeywords(text), []);
        const labels = getResumeSectionLabels(data.language);
        const isAr = data.language === 'ar';
        const dir = isAr ? 'rtl' : 'ltr';
        const textAlign = isAr ? 'right' : 'left';
        const fontFamily = isAr
            ? "'Noto Sans Arabic', 'Arial', sans-serif"
            : "'Arial', sans-serif";

        function esc(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function sectionHtml(title, items) {
            const list = Array.isArray(items) ? items.filter(Boolean) : (items ? [items] : []);
            if (!list.length) return '';
            const rows = list.map(item => `<li>${esc(item)}</li>`).join('');
            return `<div class="sec">
  <div class="sec-title">${esc(title)}</div>
  <ul>${rows}</ul>
</div>`;
        }

        const sectionsHtml = [
            sectionHtml(labels.objective, data.objective ? [data.objective] : []),
            sectionHtml(labels.education, data.education),
            sectionHtml(labels.experience, data.experience),
            sectionHtml(labels.courses, data.courses),
            sectionHtml(labels.skills, data.technicalSkills),
            sectionHtml(labels.languages, data.languages),
            sectionHtml(labels.reference, data.reference)
        ].join('');

        const baseName = originalName.replace(/\.(pdf|html|docx|doc)$/i, '');

        const html = `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${dir}">
<head>
<meta charset="UTF-8">
<title>${esc(baseName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Arial&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: auto; background: #fff; }
  body {
    font-family: ${fontFamily};
    direction: ${dir};
    text-align: ${textAlign};
    color: #111827;
  }
  .page {
    width: 210mm;
    padding: 14mm 16mm 10mm 16mm;
    margin: 0 auto;
  }
  .name { font-size: 18pt; font-weight: 700; text-align: center; margin-bottom: 3px; line-height: 1.2; }
  .role { font-size: 10.5pt; font-weight: 700; text-align: center; color: #374151; margin-bottom: 3px; }
  .contact { font-size: 8.5pt; text-align: center; color: #4b5563; padding-bottom: 6px; border-bottom: 2px solid #111827; margin-bottom: 10px; line-height: 1.5; }
  .sec { margin-top: 10px; page-break-inside: avoid; break-inside: avoid; }
  .sec-title {
    font-size: 9pt; font-weight: 700; color: #111827;
    border-bottom: 1px solid #d1d5db;
    padding-bottom: 3px; margin-bottom: 5px;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  ul { padding-${isAr ? 'right' : 'left'}: 15px; margin: 0; }
  li { font-size: 9pt; line-height: 1.45; margin-bottom: 2px; }
  @media print {
    html, body { height: auto; background: #fff; }
    .page { width: 100%; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 14mm 16mm 14mm 16mm; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="name">${esc(data.name)}</div>
  <div class="role">${esc(data.role)}</div>
  <div class="contact">${esc(data.contact)}</div>
  ${sectionsHtml}
</div>
<script>
  document.fonts.ready.then(function() {
    window.print();
  });
<\/script>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
        } else {
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            downloadBlob(blob, baseName + '-resume.html');
        }
    }

    async function exportAsDocx(text, originalName) {
        const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
        const sectionTitles = new Set(['CAREER OBJECTIVE', 'EDUCATION', 'EXPERIENCES', 'COURSES', 'SKILLS', 'LANGUAGES', 'REFERENCE']);
        const paragraphs = text.split('\n').map((line, index) => {
            const trimmed = line.trim();
            const isMainName = index === 0;
            const isTitle = sectionTitles.has(trimmed);
            return new Paragraph({
                bidirectional: false,
                alignment: AlignmentType.LEFT,
                spacing: { after: isTitle ? 120 : 80 },
                children: [new TextRun({
                    text: trimmed || ' ',
                    size: isMainName ? 32 : isTitle ? 28 : 24,
                    bold: isMainName || isTitle || index === 1
                })]
            });
        });
        const doc = new Document({ sections: [{ children: paragraphs }] });
        const blob = await Packer.toBlob(doc);
        downloadBlob(blob, originalName.replace(/\.(docx|doc)$/i, '') + '-محسن.docx');
    }

    // --- Section 1: CV Engineer Logic ---
    const generateCvBtn = document.getElementById('generate-cv-btn');
    const cvFileInput = document.getElementById('cv-file');
    const cvFileStatus = document.getElementById('cv-file-status');
    const currentCvInput = document.getElementById('current-cv');
    const improvedCvOutput = document.getElementById('improved-cv-output');
    const resumeTemplatePreview = document.getElementById('resume-template-preview');
    const atsFeedback = document.getElementById('ats-feedback');
    const downloadCvBtn = document.getElementById('download-cv-btn');
    const copyBtns = document.querySelectorAll('.copy-btn');
    const surveyLangBtns = document.querySelectorAll('.survey-lang-btn');
    const surveyPlaceholders = {
        en: {
            'user-full-name': 'Full Name',
            'user-email': 'Email Address',
            'user-phone': 'Phone Number',
            'user-region': 'Location / City',
            'user-college': 'College or University',
            'user-major': 'Major',
            'user-gpa': 'GPA',
            'user-linkedin': 'LinkedIn Profile',
            'cv-career-objective': 'Career Objective',
            'cv-education': 'Education, major, GPA, graduation year',
            'user-experience': 'Professional Experiences, one item per line',
            'user-courses': 'Training Courses, one course per line',
            'user-skills': 'Skills, one skill per line',
            'cv-languages': 'Languages, e.g. Arabic: Native / English: Intermediate',
            'cv-reference': 'Reference, e.g. Available upon request'
        },
        ar: {
            'user-full-name': 'الاسم',
            'user-email': 'البريد الإلكتروني',
            'user-phone': 'رقم الهاتف',
            'user-region': 'المكان',
            'user-college': 'المؤسسة التعليمية',
            'user-major': 'التخصص أو المؤهل التعليمي',
            'user-gpa': 'المعدل أو سنة التخرج',
            'user-linkedin': 'رابط لينكدإن',
            'cv-career-objective': 'الهدف الوظيفي',
            'cv-education': 'المؤهل التعليمي',
            'user-experience': 'الخبرات المهنية',
            'user-courses': 'الدورات التدريبية',
            'user-skills': 'المهارات',
            'cv-languages': 'اللغات',
            'cv-reference': 'المراجع'
        }
    };
    let uploadedCvFile = null;
    let improvedCvText = '';
    let currentResumeData = null;

    function setSurveyLanguage(language) {
        surveyLangBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.surveyLang === language));
        Object.entries(surveyPlaceholders[language] || {}).forEach(([id, placeholder]) => {
            const field = document.getElementById(id);
            if (field) field.placeholder = placeholder;
        });
    }

    surveyLangBtns.forEach(btn => {
        btn.addEventListener('click', () => setSurveyLanguage(btn.dataset.surveyLang || 'en'));
    });

    if (cvFileInput) {
        cvFileInput.addEventListener('change', async () => {
            const file = cvFileInput.files && cvFileInput.files[0];
            uploadedCvFile = file || null;
            improvedCvText = '';
            currentResumeData = null;
            improvedCvOutput.value = '';
            atsFeedback.value = '';
            if (resumeTemplatePreview) {
                resumeTemplatePreview.innerHTML = '';
                resumeTemplatePreview.classList.remove('active');
            }
            downloadCvBtn.disabled = true;
            if (!file) return;

            cvFileStatus.innerHTML = '<i class="fa-solid fa-spinner"></i> جاري قراءة الملف...';
            try {
                const text = await extractCvText(file);
                if (!text) throw new Error('لم نتمكن من استخراج نص واضح من الملف. تأكد أن الملف ليس صورة ممسوحة ضوئيًا.');
                currentCvInput.value = text;
                cvFileStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم تحميل الملف: ${file.name}`;
                showToast('تم استخراج نص السيرة بنجاح.');
            } catch (error) {
                currentCvInput.value = '';
                uploadedCvFile = null;
                cvFileStatus.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> تعذر قراءة الملف';
                showToast(error.message, 'error');
            }
        });
    }

    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if(el && el.value) {
                navigator.clipboard.writeText(el.value).then(() => {
                    showToast('تم نسخ النص بنجاح!');
                });
            }
        });
    });

    if (generateCvBtn) {
        generateCvBtn.addEventListener('click', () => {
            const jobTitle = document.getElementById('target-job-title').value.trim();
            const userInfo = readUserInfo();
            const cv = [
                userInfo.fullName,
                userInfo.email,
                userInfo.phone,
                userInfo.region,
                userInfo.careerObjective,
                userInfo.educationText,
                userInfo.experience,
                userInfo.courses,
                userInfo.skills,
                userInfo.languages
            ].filter(Boolean).join('\n');
            const jd = userInfo.jobDetails || `${jobTitle} ${userInfo.company} ${userInfo.department} ${userInfo.skills} ${userInfo.experience}`;

            if(!cv || !jobTitle) {
                showToast('الرجاء إدخال المسمى الوظيفي وبيانات الاستبيان أولاً.', 'error');
                return;
            }

            const btnTextCv = generateCvBtn.querySelector('.btn-text');
            btnTextCv.textContent = 'جاري المعالجة والتحليل...';
            generateCvBtn.disabled = true;

            setTimeout(() => {
                const result = buildEnhancedCv(cv, jd, jobTitle, userInfo);
                improvedCvText = result.enhancedCv;
                currentResumeData = result.resumeData;
                improvedCvOutput.value = result.enhancedCv;
                if (resumeTemplatePreview) {
                    resumeTemplatePreview.innerHTML = buildResumeHtml(result.resumeData);
                    resumeTemplatePreview.classList.add('active');
                }
                atsFeedback.value = result.atsReport;
                downloadCvBtn.disabled = false;
                
                btnTextCv.textContent = 'تحسين ملف السيرة بالخوارزمية';
                generateCvBtn.disabled = false;
                showToast('تم بنجاح! تم تحسين السيرة الذاتية.');
            }, 2500);
        });
    }

    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', async () => {
            if (!improvedCvText) {
                showToast('لا يوجد ملف محسّن جاهز للتحميل.', 'error');
                return;
            }
            const outputName = `${currentResumeData?.name || 'resume'}.pdf`;
            try {
                exportAsPdf(improvedCvText, outputName);
                showToast('تم تحميل السيرة الذاتية المحسّنة كملف PDF.');
            } catch (error) {
                showToast('تعذر إنشاء الملف. يمكنك نسخ النص المحسّن يدويًا.', 'error');
            }
        });
    }

    // --- Section 2: Interview Coach Logic ---
    const startInterviewBtn = document.getElementById('start-interview-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatTextarea = document.getElementById('chat-textarea');
    const sendMsgBtn = document.getElementById('send-msg-btn');
    
    let interviewActive = false;
    let interviewTurn = 0;

    function addMessage(text, sender) {
        const msgRow = document.createElement('div');
        msgRow.className = `msg-row msg-${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.textContent = text;
        
        msgRow.appendChild(bubble);
        chatMessages.appendChild(msgRow);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const msgRow = document.createElement('div');
        msgRow.className = `msg-row msg-ai typing-row`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
        msgRow.appendChild(bubble);
        chatMessages.appendChild(msgRow);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgRow;
    }

    if (startInterviewBtn) {
        startInterviewBtn.addEventListener('click', () => {
            chatMessages.innerHTML = ''; // Clear empty state
            interviewActive = true;
            interviewTurn = 0;
            currentInterviewScenario = buildMixedInterviewScenario();
            chatTextarea.disabled = true;
            sendMsgBtn.disabled = true;
            startInterviewBtn.disabled = true;
            startInterviewBtn.style.display = 'none';
            playInterviewScenario();
        });
    }

    function handleSendMsg() {
        return;
    }

    if(sendMsgBtn) {
        sendMsgBtn.addEventListener('click', handleSendMsg);
    }
    
    if(chatTextarea) {
        chatTextarea.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMsg();
            }
        });
        chatTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }


    // --- Section 3: Career Library ---
    const libraryItems = [
        { title: 'CCNA Part 1 Free', category: 'Technical-Category', description: 'ملف PDF تعليمي لأساسيات CCNA - الجزء الأول.', url: 'files/ccna-part-1-free.pdf', type: 'pdf' },
        { title: 'دليل خوارزمية لينكدإن لعام 2024', category: 'Career-Category', description: 'ملف PDF يشرح آلية تحسين الظهور والتفاعل على LinkedIn وفق خوارزمية 2024.', url: 'files/linkedin-algorithm-guide-2024.pdf', type: 'pdf' }
    ];
    const influencerItems = [
        {
            name: 'احمد القحطاني',
            category: 'Career-Category',
            description: 'حساب مؤثر في المجال المهني ومحتوى تطوير المواهب.',
            image: 'assets/ahmed-alqahtani.jpg?v=1',
            url: 'https://www.tiktok.com/@talentsaudi?_r=1&_t=ZS-96pNmUKAM2f'
        },
        {
            name: 'سجاد غفوري',
            category: 'Technical-Category',
            description: 'حساب مؤثر في مجال الشبكات والمحتوى التقني.',
            image: 'assets/sajjad-ghafouri.jpg?v=1',
            url: 'https://youtube.com/@iiinetworking?si=QtRXgIGvxa79giCI'
        }
    ];
    const goldenTips = [
        {
            icon: 'fa-star',
            title: 'حدّث ملفك الشخصي على لينكدإن دائمًا',
            body: 'اجعل صورتك احترافية، وأضف ملخصًا واضحًا، وتأكد أن المسمى الوظيفي يعكس هدفك المهني الحالي.'
        },
        {
            icon: 'fa-network-wired',
            title: 'الشبكات المهنية أقوى من السيرة الذاتية',
            body: 'التواصل مع أشخاص من مجالك يفتح أبوابًا لا تُفتح بالتقديم المباشر. اهتم بناء علاقات حقيقية قبل أن تحتاجها.'
        },
        {
            icon: 'fa-certificate',
            title: 'الشهادة التقنية تُقرّب المسافات',
            body: 'شهادة مثل CCNA أو CompTIA تُثبت كفاءتك بشكل ملموس للمسمى الوظيفي وتزيد من قابلية توظيفك بشكل كبير.'
        },
        {
            icon: 'fa-magnifying-glass-chart',
            title: 'افهم الشركة قبل المقابلة',
            body: 'ابحث عن منتجات الشركة، ثقافتها، وآخر أخبارها. المرشح الذي يعرف الشركة يترك انطباعًا أقوى بكثير.'
        },
        {
            icon: 'fa-file-lines',
            title: 'خصّص سيرتك الذاتية لكل وظيفة',
            body: 'لا ترسل نفس السيرة لكل شركة. اقرأ الإعلان واستخدم نفس كلماته المفتاحية في سيرتك حتى تنجح في فلتر ATS.'
        },
        {
            icon: 'fa-people-arrows',
            title: 'المقابلة محادثة لا اختبار',
            body: 'تذكر أن المقابلة فرصة لتكتشف أنت أيضًا إن كانت الشركة مناسبة لك. تحدث بثقة واطرح أسئلة ذكية في النهاية.'
        },
        {
            icon: 'fa-rotate',
            title: 'تعلّم من كل رفض',
            body: 'كل رفض يحمل درسًا. اطلب ملاحظات إن أمكن، وراجع ما يمكن تحسينه في سيرتك أو أسلوب مقابلاتك.'
        },
        {
            icon: 'fa-laptop-code',
            title: 'أبرز مشاريعك العملية',
            body: 'المشاريع الشخصية والتطبيقية تعوّض قلة الخبرة. انشرها على GitHub أو LinkedIn وشارك تفاصيل ما تعلمته منها.'
        }
    ];
    const libraryGrid = document.getElementById('library-grid');
    const libraryFilters = document.querySelectorAll('.library-filter');

    function renderLibraryItems(category = 'all') {
        if (!libraryGrid) return;
        const filteredItems = category === 'all' ? libraryItems : category === 'Influencers' ? [] : libraryItems.filter(item => item.category === category);
        const filteredInfluencers = category === 'all' || category === 'Influencers' ? influencerItems : [];
        const libraryCards = filteredItems.map(item => `
            <article class="library-card">
                ${item.type === 'pdf' ? `
                    <div class="library-pdf-preview">
                        <canvas data-pdf-preview="${escapeHtml(item.url)}" aria-label="${escapeHtml(item.title)}"></canvas>
                    </div>
                ` : `
                    <div class="library-card-icon">
                        <i class="fa-solid ${item.category === 'Technical-Category' ? 'fa-network-wired' : 'fa-briefcase'}"></i>
                    </div>
                `}
                <div class="library-card-body">
                    <span class="library-category">${item.category}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description)}</p>
                </div>
                <a class="btn btn-outline btn-sm library-download" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-download"></i> تحميل الملف
                </a>
            </article>
        `).join('');
        libraryGrid.innerHTML = libraryCards;
        renderPdfPreviews();
    }

    function renderGoldenTips() {
        const grid = document.getElementById('golden-tips-grid');
        if (!grid) return;
        const totalImages = 60;
        const images = Array.from({ length: totalImages }, (_, i) => `assets/golden-tips/tip-${i + 1}.jpeg`);

        grid.innerHTML = images.map((src, i) => `
            <div class="gt-card" data-index="${i}">
                <img src="${src}" alt="نصيحة ذهبية ${i + 1}" loading="lazy">
                <div class="gt-overlay">
                    <span class="gt-num">${i + 1}</span>
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                </div>
            </div>
        `).join('');

        // Lightbox
        let lightbox = document.getElementById('gt-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'gt-lightbox';
            lightbox.innerHTML = `
                <div class="gt-lb-backdrop"></div>
                <div class="gt-lb-content">
                    <button class="gt-lb-close"><i class="fa-solid fa-xmark"></i></button>
                    <button class="gt-lb-prev"><i class="fa-solid fa-chevron-right"></i></button>
                    <img id="gt-lb-img" src="" alt="">
                    <button class="gt-lb-next"><i class="fa-solid fa-chevron-left"></i></button>
                    <span id="gt-lb-counter"></span>
                </div>
            `;
            document.body.appendChild(lightbox);

            let current = 0;
            const lbImg = document.getElementById('gt-lb-img');
            const lbCounter = document.getElementById('gt-lb-counter');

            function openLb(idx) {
                current = idx;
                lbImg.src = images[current];
                lbCounter.textContent = `${current + 1} / ${totalImages}`;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
            function closeLb() {
                lightbox.classList.remove('open');
                document.body.style.overflow = '';
            }

            lightbox.querySelector('.gt-lb-backdrop').addEventListener('click', closeLb);
            lightbox.querySelector('.gt-lb-close').addEventListener('click', closeLb);
            function goTo(idx) {
                current = (idx + totalImages) % totalImages;
                const newImg = new Image();
                newImg.onload = () => { lbImg.src = newImg.src; };
                newImg.src = images[current];
                lbCounter.textContent = `${current + 1} / ${totalImages}`;
            }
            lightbox.querySelector('.gt-lb-prev').addEventListener('click', () => goTo(current - 1));
            lightbox.querySelector('.gt-lb-next').addEventListener('click', () => goTo(current + 1));
            document.addEventListener('keydown', e => { if (!lightbox.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') goTo(current - 1); if (e.key === 'ArrowLeft') goTo(current + 1); });

            grid.addEventListener('click', e => {
                const card = e.target.closest('.gt-card');
                if (card) openLb(parseInt(card.dataset.index));
            });
        }
    }

    function renderPdfPreviews() {
        if (!window.pdfjsLib) return;
        document.querySelectorAll('[data-pdf-preview]').forEach(canvas => {
            const fileUrl = canvas.getAttribute('data-pdf-preview');
            pdfjsLib.getDocument(fileUrl).promise
                .then(pdf => pdf.getPage(1))
                .then(page => {
                    const viewport = page.getViewport({ scale: 0.55 });
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    return page.render({ canvasContext: context, viewport }).promise;
                })
                .catch(() => {
                    const fallback = document.createElement('div');
                    fallback.className = 'library-card-icon';
                    fallback.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';
                    canvas.closest('.library-pdf-preview')?.replaceWith(fallback);
                });
        });
    }

    libraryFilters.forEach(button => {
        button.addEventListener('click', () => {
            libraryFilters.forEach(item => {
                item.classList.remove('active', 'btn-primary');
                item.classList.add('btn-outline');
            });
            button.classList.add('active', 'btn-primary');
            button.classList.remove('btn-outline');
            renderLibraryItems(button.getAttribute('data-category'));
        });
    });

    renderLibraryItems();

    // --- Section 4: Company Intelligence ---
    const getReportBtn = document.getElementById('get-report-btn');
    const companyNameInput = document.getElementById('company-name');
    const companyReportFiles = {
        'stc': { title: 'STC', url: 'files/company-reports/تقرير_STC.pdf' },
        'تحكم': { title: 'تحكم', url: 'files/company-reports/تقرير_تحكم.pdf' },
        'سدايا': { title: 'سدايا', url: 'files/company-reports/تقرير_سدايا.pdf' },
        'سيسكو': { title: 'سيسكو', url: 'files/company-reports/تقرير_سيسكو.pdf' },
        'علم': { title: 'علم', url: 'files/company-reports/تقرير_شركة_علم_درب.pdf' }
    };

    renderGoldenTips();

    // --- Influencers Section ---
    const influencerAccounts = [
        { nameAr: 'سَ | وظائف', handle: '@S2_JOB2', url: 'https://x.com/s2_job2', bio: 'أخصائي استقطاب وعضو معتمد في اتحاد التوظيف البريطاني (REC).', image: 'assets/influencers/image1.png' },
        { nameAr: 'أنس إبراهيم', handle: '@anas_ibrahim97', url: 'https://x.com/anas_ibrahim97', bio: 'مختص في إدارة وتطوير قنوات اليوتيوب — أحوّل قناتك إلى علامة تجارية ومصدر دخل حقيقي.', image: 'assets/influencers/image2.png' },
        { nameAr: 'خطاف الخطاف', handle: '@khattaf1', url: 'https://x.com/khattaf1', bio: 'شريك إعلاني معتمد من Google Ads ومستشار تسويق، حائز جائزة الأميرة صيتة في المعرفة الرقمية.', image: 'assets/influencers/image3.png' },
        { nameAr: 'ترند الأخبار | Trendnews24', handle: '@trendnews_24', url: 'https://x.com/trendnews_24', bio: 'منصة ترند الأخبار ترصد جميع الأخبار الرائجة في السعودية والعالم.', image: 'assets/influencers/image4.png' },
        { nameAr: 'أحمد الزهراني', handle: '@ENGAALZAHRANI', url: 'https://x.com/engaalzahrani', bio: 'تمكين قادة المستقبل في الموارد البشرية — مؤسس منصة عالم الموارد البشرية.', image: 'assets/influencers/image5.png' },
        { nameAr: 'كورسات', handle: '@c_4et', url: 'https://x.com/c_4et', bio: 'حساب مهتم بنشر مقالات في برمجة الويب وكورسات مجانية في مجال الويب.', image: 'assets/influencers/image6.png' },
        { nameAr: 'ترافس TRAVIS', handle: '@iirode0', url: 'https://x.com/iirode0', bio: 'ينقل أخبار وتغطيات ومنوعات من شتى بقاع العالم.', image: 'assets/influencers/image7.png' },
        { nameAr: 'عبير الحسن', handle: '@AbeerAlhasan', url: 'https://x.com/abeeralhasan', bio: 'رائدة أعمال ومستشارة تسويق، مؤثرة رقمية تدرب في التقنية وتقود تطوير الأعمال.', image: 'assets/influencers/image8.png' },
        { nameAr: 'سعود في السوق الأمريكي', handle: '@s_usa2001', url: 'https://x.com/s_usa2001', bio: 'مهتم ومستثمر في السوق الأمريكي — محتوى استثماري متخصص.', image: 'assets/influencers/image9.png' },
        { nameAr: 'البرمجة للجميع', handle: '@p_4all', url: 'https://x.com/p_4all', bio: 'فريق متخصص بتقديم خدمات البرمجة وتطوير وتصميم مواقع الويب.', image: 'assets/influencers/image10.png' },
        { nameAr: 'مبارك آل مبارك', handle: '@Mbk8g', url: 'https://x.com/mbk8g', bio: 'ينشر ويترجم كل جديد وحصري من الأخبار المحلية والعالمية.', image: 'assets/influencers/image11.png' },
        { nameAr: 'فهد بن مبارك HR', handle: '@fhd20hm', url: 'https://x.com/fhd20hm', bio: 'مختص بصياغة عقود العمل والامتثال لنظامها وتبسيط تعقيدات العلاقة العمالية والموارد البشرية.', image: 'assets/influencers/image12.png' },
        { nameAr: 'دليلك للآيلتس', handle: '@Dalilk4ielts', url: 'https://x.com/dalilk4ielts', bio: 'مدرب في الآيلتس والتطوير المهني، عضو في الاتحاد الدولي للتدريب ICF.', image: 'assets/influencers/image13.png' },
        { nameAr: 'عماد الشريف', handle: '@3madAlshareef', url: 'https://x.com/3madalshareef', bio: 'مهتم بشؤون التعليم والوظائف.', image: 'assets/influencers/image14.png' },
        { nameAr: 'مصعب المرشدي', handle: '@malmarshedi', url: 'https://x.com/malmarshedi', bio: 'مستثمر متخصص في قطاع صناعة المستحضرات الطبية والتجميلية والأجهزة الطبية.', image: 'assets/influencers/image15.png' },
        { nameAr: 'أبو يزن', handle: '@AymanBasha', url: 'https://x.com/aymanbasha', bio: 'متخصص في التجارة الإلكترونية وخدمات شراء واستيراد وشحن من الصين.', image: 'assets/influencers/image16.png' },
        { nameAr: 'تعلم إكسل مجاناً', handle: '@ExcelAr22', url: 'https://x.com/excelar22', bio: 'كل ما تحتاج معرفته لاحتراف إكسل — متاح مجاناً.', image: 'assets/influencers/image17.png' },
        { nameAr: 'سعيد عبدالجبار', handle: '@Saeed_AJ', url: 'https://x.com/saeed_aj', bio: 'مستثمر ومهتم بمواضيع أسواق المال والأعمال.', image: 'assets/influencers/image18.png' },
        { nameAr: 'بندر المسند', handle: '@EcoOneE', url: 'https://x.com/ecoonee', bio: 'كاتب محترف، مؤسس وكالة محتوى ابداع، ومختص بالتسويق وصناعة المحتوى.', image: 'assets/influencers/image19.png' },
        { nameAr: 'محمد بن دليم القحطاني', handle: '@DrMDMQ', url: 'https://x.com/drmdmq', bio: 'مفكر اقتصادي متخصص في اقتصاد المستقبل والتحولات العالمية.', image: 'assets/influencers/image20.jpeg' },
        { nameAr: 'وافي بن عبدالله', handle: '@Dr_Wafy', url: 'https://x.com/dr_wafy', bio: 'أكاديمي، دكتور في اللغويات الحاسوبية.', image: 'assets/influencers/image21.png' },
        { nameAr: 'منصة ترس', handle: '@Taras_saudi', url: 'https://x.com/taras_saudi', bio: 'وظائف وأكثر — منصة سعودية لمتابعة فرص العمل.', image: 'assets/influencers/image22.png' },
        { nameAr: 'عبدالعزيز المهباش', handle: '@AAlmehbash', url: 'https://x.com/aalmehbash', bio: 'مقدم برامج وكاتب إعلامي مختص في الموارد البشرية.', image: 'assets/influencers/image23.jpeg' },
        { nameAr: 'إياد الحمر', handle: '@Eyaaaad', url: 'https://x.com/eyaaaad', bio: 'ينشر غرائب الأخبار والمقاطع والدراسات العالمية التي قد لا ينشرها الإعلام.', image: 'assets/influencers/image24.png' },
        { nameAr: 'رضا العيدروس', handle: '@Reda_Alidarous', url: 'https://x.com/reda_alidarous', bio: 'مستشار مالي، خبرة مصرفية ومالية 26 عاماً، خبير في التحليل والتقييم الائتماني.', image: 'assets/influencers/image25.png' },
        { nameAr: 'عبدالمجيد', handle: '@Abdulmajeedful', url: 'https://x.com/abdulmajeedful', bio: 'ماجستير موارد بشرية، بكالوريوس إدارة أعمال.', image: 'assets/influencers/image26.jpeg' },
        { nameAr: 'ثامر الغالي', handle: '@i3rab', url: 'https://x.com/i3rab', bio: 'نبحر في عالم السياحة والتقنية.', image: 'assets/influencers/image27.jpeg' },
        { nameAr: 'ماجد المقاطي', handle: '@malmuqti', url: 'https://x.com/malmuqti', bio: 'مهتم بالاستثمار وأسواق المال.', image: 'assets/influencers/image28.png' }
    ];

    const platformIcons = {
        twitter:  { icon: 'fa-brands fa-x-twitter',  color: '#111', label: 'X / Twitter' },
        youtube:  { icon: 'fa-brands fa-youtube',     color: '#ff0000', label: 'YouTube' },
        linkedin: { icon: 'fa-brands fa-linkedin',    color: '#0077b5', label: 'LinkedIn' },
        instagram:{ icon: 'fa-brands fa-instagram',   color: '#e1306c', label: 'Instagram' }
    };

    function renderInfluencers() {
        const grid = document.getElementById('influencers-grid');
        if (!grid) return;

        // كل المؤثرين بنفس شكل البطاقة: صورة دائرية + اسم + وصف + رابط
        const allCards = [
            ...influencerItems.map(item => ({ nameAr: item.name, handle: '', url: item.url, bio: item.description, image: item.image })),
            ...influencerAccounts
        ].map(p => `
            <article class="library-card influencer-card">
                <img class="influencer-photo" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.nameAr)}" onerror="this.style.display='none'">
                <div class="library-card-body">
                    <h3>${escapeHtml(p.nameAr)}</h3>
                    ${p.handle ? `<span class="inf-handle-small">${escapeHtml(p.handle)}</span>` : ''}
                    <p>${escapeHtml(p.bio)}</p>
                </div>
                <a class="btn btn-outline btn-sm library-download" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> رابط الحساب
                </a>
            </article>
        `).join('');

        grid.innerHTML = `<div class="library-grid">${allCards}</div>`;
    }

    renderInfluencers();

    // --- Job Platforms ---
    const jobPlatforms = [
        { name: 'LinkedIn', nameAr: 'لينكدإن', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg', desc: 'المنصة الأولى عالمياً للتوظيف المهني والشبكات.', url: 'https://www.linkedin.com/jobs/', tag: 'عالمية', color: '#0077b5' },
        { name: 'Jadarat', nameAr: 'جدارات', logo: 'https://jadarat.sa/static/media/jadarat-logo.png', desc: 'البوابة الوطنية للتوظيف في المملكة العربية السعودية.', url: 'https://jadarat.sa/', tag: 'سعودية', color: '#1e5c9b' },
        { name: 'Bayt', nameAr: 'بيت.كوم', logo: 'https://www.bayt.com/favicon-32x32.png', desc: 'من أكبر مواقع التوظيف في منطقة الشرق الأوسط.', url: 'https://www.bayt.com/', tag: 'خليجية', color: '#e55a23' },
        { name: 'Naukrigulf', nameAr: 'نوكري الخليج', logo: 'https://www.naukrigulf.com/favicon.ico', desc: 'منصة توظيف متخصصة في دول الخليج العربي.', url: 'https://www.naukrigulf.com/', tag: 'خليجية', color: '#2d6cb4' },
        { name: 'Indeed', nameAr: 'إنديد', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.svg', desc: 'محرك بحث وظيفي ضخم يجمع إعلانات من آلاف المواقع.', url: 'https://sa.indeed.com/', tag: 'عالمية', color: '#003A9B' },
        { name: 'Glassdoor', nameAr: 'جلاسدور', logo: 'https://www.glassdoor.com/favicon.ico', desc: 'وظائف + تقييمات الشركات والرواتب من الموظفين.', url: 'https://www.glassdoor.com/', tag: 'عالمية', color: '#0CAA41' },
        { name: 'Hiredly', nameAr: 'هايرد لي', logo: 'https://cdn.worldvectorlogo.com/logos/wobb.svg', desc: 'منصة توظيف للخريجين الجدد وأصحاب الخبرات المتوسطة.', url: 'https://www.hiredly.com/', tag: 'عالمية', color: '#6c63ff' },
        { name: 'Tanqeeb', nameAr: 'تنقيب', logo: 'https://tanqeeb.com/favicon.ico', desc: 'منصة عربية للتوظيف تغطي السوق السعودي والخليجي.', url: 'https://tanqeeb.com/', tag: 'سعودية', color: '#d4741a' },
        { name: 'Gulftalent', nameAr: 'غلف تالنت', logo: 'https://www.gulftalent.com/favicon.ico', desc: 'منصة وظائف متخصصة للمهنيين في منطقة الخليج.', url: 'https://www.gulftalent.com/', tag: 'خليجية', color: '#1d4e89' },
        { name: 'Sabbar', nameAr: 'صبّار', logo: 'https://sabbar.com/favicon.ico', desc: 'منصة سعودية للوظائف بالساعة والدوام الجزئي والكامل.', url: 'https://sabbar.com/', tag: 'سعودية', color: '#f9a825' }
    ];

    function renderJobPlatforms() {
        const grid = document.getElementById('job-platforms-grid');
        if (!grid) return;
        grid.innerHTML = jobPlatforms.map(p => `
            <a class="job-platform-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
                <div class="jp-logo-wrap">
                    <img src="${p.logo}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <div class="jp-logo-fallback" style="display:none;background:${p.color}"><span>${p.name[0]}</span></div>
                </div>
                <div class="jp-body">
                    <div class="jp-header">
                        <h3>${p.nameAr}</h3>
                        <span class="jp-tag">${p.tag}</span>
                    </div>
                    <p>${p.desc}</p>
                    <span class="jp-url">${p.url}</span>
                </div>
                <div class="jp-arrow"><i class="fa-solid fa-arrow-left"></i></div>
            </a>
        `).join('');
    }

    renderJobPlatforms();

    if(getReportBtn) {
        getReportBtn.addEventListener('click', () => {
            const selectedCompany = companyReportFiles[companyNameInput?.value.trim().toLowerCase()];

            if(!selectedCompany) {
                showToast('يرجى اختيار شركة من القائمة أولاً.', 'error');
                return;
            }

            window.open(selectedCompany.url, '_blank', 'noopener,noreferrer');
            showToast(`تم فتح ملف شركة ${selectedCompany.title}.`);
        });
    }
});
