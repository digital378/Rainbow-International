# Graph Report - code-only  (2026-08-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1878 nodes · 2223 edges · 187 communities (132 shown, 55 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f419ae5d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 142
- Community 143
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 166
- Community 168
- Community 169
- Community 171
- Community 175

## God Nodes (most connected - your core abstractions)
1. `DbStorage` - 51 edges
2. `registerRoutes()` - 51 edges
3. `IStorage` - 49 edges
4. `e()` - 17 edges
5. `registerWalkinRoutes()` - 17 edges
6. `MarketingDashboard()` - 13 edges
7. `getAuthenticatedClient()` - 11 edges
8. `renderProseSection()` - 11 edges
9. `e()` - 11 edges
10. `clamp()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `registerRoutes()` --calls--> `createLegacyRedirectRouter()`  [EXTRACTED]
  server/routes.ts → server/blogRoutes.ts
- `registerRoutes()` --calls--> `getKnownBlogSlugs()`  [EXTRACTED]
  server/routes.ts → server/blogRoutes.ts
- `registerRoutes()` --calls--> `getRegistryCounts()`  [EXTRACTED]
  server/routes.ts → server/blogRoutes.ts
- `registerRoutes()` --calls--> `isKnownBlogSlug()`  [EXTRACTED]
  server/routes.ts → server/blogRoutes.ts
- `registerRoutes()` --calls--> `noteBlogSlugAdded()`  [EXTRACTED]
  server/routes.ts → server/blogRoutes.ts

## Import Cycles
- None detected.

## Communities (187 total, 55 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (72): About, AcademicCalendar, AcademicTeam, AdminBlog, AdminFriendshipSchools, AdminRAs, AdminSubmissions, Admissions (+64 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (57): BlogPost, blogPostsTable, BrochureRequest, brochureRequests, CallbackRequest, callbackRequests, CareerApplication, careerApplications (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (27): CRAWLER_UA_RE, CRAWLER_UA_SUBSTRINGS, isCrawlerUa(), registerHomeSSR(), renderHomeSSR(), e(), pages, PageSSRConfig (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (29): AlliancesData, AN(), AnimatedBarRow(), AnimatedRing(), BrandPartner, C, CategoryEntry, Corporate (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (29): $all(), ballSVG(), buildNameRegex(), celebrate(), drawConfetti(), el(), ensureCanvas(), ensureCard() (+21 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (20): Branch, BranchesTab(), downloadQRPdf(), getSavedToken(), hdrs(), inp(), LeadChange, LOOKUP_SECTIONS (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (31): CAT_IMAGE, e(), IMMERSIVE_SLUGS, registerSSRRoutes(), renderBlogSSR(), renderInlineMd(), toISODate(), paras() (+23 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (27): boot(), buildStars(), capSet(), clamp(), detectWebGL(), glowTexture(), init3D(), interpKeys() (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (29): aggregateCrmRows(), ALLOWED_CLOSE_REASONS, ALLOWED_GRADES_MASTER, ALLOWED_GRADES_RIS, ALLOWED_GRADES_RPS, ALLOWED_SOURCES, ALLOWED_STATUSES, ALLOWED_STATUSES_BRAND (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (26): checkImageMagicBytes(), crmMonthLabel(), registerRoutes(), alliancesSessionToken(), appendEnquiryToCrmLeadsTracker(), appendEnquiryToSheet(), appendFriendshipLeadToSheets(), appendLeadsToAggregateTab() (+18 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (20): OPENAPI_YAML, BLOG_IMAGE_ALLOWED_MIMES, BLOG_UPLOAD_DIR, blogImageUpload, careerUpload, friendshipSubmitRateLimit, getLeadSourceLabel(), getMediumLabel() (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (21): cpa(), cpb(), cpl(), cpw(), deltaArrow(), getSegment(), inr(), LiveBranch (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (24): CRM_RPS, CrmRow, CURRENT_IDX, DAYS_IN_CURRENT_MONTH, DAYS_IN_MAY, DEFAULT_FIXED, _existing, _HISTORICAL_ROWS (+16 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): calcRevenue(), csvDownload(), FEE_RULES, feeFor(), fmt(), fmtL(), INR(), MarketingMonth (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.10
Nodes (10): AboutPreview, AcademicSections, BeyondClassroomSection, ContactForm, DiscoverRainbow, HOME_FAQS, Neighbourhood, Pedagogy (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.10
Nodes (11): ChatBot(), CHIPS, getBotReply(), Message, MessageType, renderRichText(), TIME_SLOTS, documents (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.10
Nodes (10): ALL_48_TEAMS, COMBINED_CONTRIBUTIONS, CONTINENTS, FAQS, HEAD_TO_HEAD, META, TOC_ITEMS, TOP_ASSISTS (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.20
Nodes (19): createLeadSchema, deriveMonthLabel(), isAdmin(), isBrandAuthorized(), registerWalkinRoutes(), requireAdmin(), updateLeadSchema, writeAudit() (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (9): AdminBlog(), BLANK_POST, BlogPost, Faq, getToken(), InternalLink, Section, SortableSectionCardProps (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (12): BarPct(), BrandTab, CounsellorStat, Dashboard(), DashboardContent(), fmt(), INNER_TABS, InnerTab (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (10): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarSubContent (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (16): approach, classroom, coScholastic, ctaTrack(), decisionCards, evaluationPoints, gradeAdmissions, grades (+8 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (9): BarPct(), CounsellorStat, Dashboard(), fmt(), pct(), PIE_COLORS, Stats, Tab (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.14
Nodes (9): BarPct(), CounsellorStat, Dashboard(), fmt(), pct(), PIE_COLORS, Stats, Tab (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (17): ensureLeadsTab(), fetchGradesForBrand(), fetchGradesForMaster(), formatDateDDMMYYYY(), formatDateDotted(), formatTime12h(), getAuthClient(), leadToRow() (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (15): approach, classroom, coScholastic, ctaTrack(), decisionCards, evaluationPoints, FAQS, gradeAdmissions (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (13): app, http, httpServer, IncomingMessage, fetchPage(), getSeoMailer(), runAndAlert(), runSeoChecks() (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.26
Nodes (13): DYNAMIC_KNOWN_PATTERNS, escHtml(), injectSeoHead(), isKnownRoute(), isNoindexPath(), ldJson(), NOINDEX_EXACT_PATHS, PAGE_TITLES (+5 more)

### Community 31 - "Community 31"
Cohesion: 0.19
Nodes (14): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+6 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (7): getFormTrackingData(), getUTMParams(), resetFormTracking(), slugToEventName(), trackFormSubmit(), trackPageView(), Window

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (8): academicDocs, classXIIResults, classXResults, disclosureAppendix, documents, generalInfo, infrastructure, staffInfo

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (14): academicSupport, boardReadiness, ctaTrack(), decisionCards, evaluationPoints, FAQS, gradeAdmissions, grades (+6 more)

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (14): beyondAcademics, boardSupport, careerCards, ctaTrack(), decisionCards, evaluationPoints, FAQS, futureCards (+6 more)

### Community 36 - "Community 36"
Cohesion: 0.19
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (6): AuditRow, getToken(), Lead, Lookups, WALKIN_STATUSES, WalkinLeads()

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (4): Item(), ItemMedia(), itemMediaVariants, itemVariants

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (8): Dashboard, DASHBOARDS_2627, DASHBOARDS_2728, FLOW_2627, FLOW_2728, FlowStep, Internal(), isAuthed()

### Community 40 - "Community 40"
Cohesion: 0.26
Nodes (12): blogSlugFromPath(), codeOwnedSlugs, createLegacyRedirectRouter(), dbSlugs, getKnownBlogSlugs(), getRegistryCounts(), isKnownBlogSlug(), isProtectedBlogPath() (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (7): BRAND, ConfirmedLead, DuplicateInfo, formatDateDisplay(), Lookups, today(), WalkinKiosk()

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (7): artsSportsStaff, classTeachers, leadership, nonAcademicStaff, prePrimaryHeads, seniorSecondaryTeachers, subjectTeachers

### Community 46 - "Community 46"
Cohesion: 0.24
Nodes (8): AdminFriendshipSchoolsInner(), authHeader(), CommissionToggle(), getToken(), Lead, School, STATUS_COLORS, ValidationStatus

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (5): fmt(), pct(), PIE_COLORS, SalesDashboard(), SalesData

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (10): articleLd, assetVersion(), breadcrumbLd, faqLd, FAQS, icon(), KATHA_BOY_FRAMES, KATHA_SIS_FRAMES (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (11): applyMasterYellowColumnProtection(), applyYellowColumnProtection(), buildBrandStatusDropdownRequest(), buildClearValidationRequest(), buildCloseReasonDropdownRequest(), buildColumnProtectionRequests(), buildDropdownRequest(), buildMasterYellowProtectionRequests() (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (7): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (8): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSubContent, ContextMenuSubTrigger

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (8): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuSubTrigger

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (9): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (7): benefits, documents, emptyForm, gradeBlocks, grades, steps, testimonials

### Community 55 - "Community 55"
Cohesion: 0.20
Nodes (6): AMENITIES_FAQS, educationalResources, organicFarmingImages, sportsSpaces, supportEquipments, talentSpaces

### Community 56 - "Community 56"
Cohesion: 0.20
Nodes (5): activities, clubItems1to5, clubItems6to8, sportsItems, testimonials

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (7): formatLeadDate(), FriendshipPortal(), GRADES, Lead, ParsedRow, School, STATUS_COLORS

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (6): aboutLinks, academicsLinks, atRainbowLinks, Dropdown(), exploreLinks, galleryLinks

### Community 59 - "Community 59"
Cohesion: 0.22
Nodes (6): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogTitle

### Community 60 - "Community 60"
Cohesion: 0.28
Nodes (4): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (3): PaginationContent, PaginationItem, PaginationLinkProps

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (6): SheetContent, SheetContentProps, SheetDescription, SheetOverlay, SheetTitle, sheetVariants

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (5): academicOpenings, benefits, CareerFormValues, nonAcademicOpenings, Opening

### Community 65 - "Community 65"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 66 - "Community 66"
Cohesion: 0.29
Nodes (4): HeroForm, quickLinks, seatData, classOptions

### Community 67 - "Community 67"
Cohesion: 0.25
Nodes (5): Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (4): DrawerContent, DrawerDescription, DrawerOverlay, DrawerTitle

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 71 - "Community 71"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (5): AdminRAs(), getToken(), Ra, School, SCHOOL_BRANCHES

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (7): BlogCard, BlogPost, Blogs(), cardHref(), categories, pinnedCards, pinnedSlugs

### Community 74 - "Community 74"
Cohesion: 0.43
Nodes (6): BrandCard(), Dashboard(), fmt(), FunnelRow(), pct(), Stats

### Community 75 - "Community 75"
Cohesion: 0.25
Nodes (6): ADMISSIONS_FAQS, ALL_FAQS_PAGE_ITEMS, FAQ_PAGE_CATEGORIES, FaqCategory, FaqItem, FaqLink

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 77 - "Community 77"
Cohesion: 0.29
Nodes (4): DialogContent, DialogDescription, DialogOverlay, DialogTitle

### Community 78 - "Community 78"
Cohesion: 0.29
Nodes (5): academicSpaces, missionPoints, philosophyPillars, sportsSpaces, stats

### Community 79 - "Community 79"
Cohesion: 0.38
Nodes (6): BlogPost(), BlogPostData, BlogSection, RelatedPost, renderInlineMarkdown(), useRelatedPosts()

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (4): assessments, methodology, pillars, stages

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (5): awards, features, pillars, programs, whyPoints

### Community 82 - "Community 82"
Cohesion: 0.38
Nodes (6): categories, getCategoryScore(), getResult(), Question, questions, SchoolReadinessQuiz()

### Community 83 - "Community 83"
Cohesion: 0.38
Nodes (6): registerCodeOwnedBlogSlug(), ARTICLE_LD, BREADCRUMB_LD, FAQ_LD, registerSpainArgentinaSSR(), renderPage()

### Community 84 - "Community 84"
Cohesion: 0.33
Nodes (6): buildBreadcrumbLd(), HOME_ORG_LD, ROUTE_SEO, routeCanonical(), RouteSeo, SITE_ORIGIN

### Community 85 - "Community 85"
Cohesion: 0.40
Nodes (5): BreadcrumbItem, isNoindexPath(), NOINDEX_EXACT_PATHS, SEO(), SEOProps

### Community 86 - "Community 86"
Cohesion: 0.47
Nodes (5): apiRequest(), getQueryFn(), queryClient, throwIfResNotOk(), UnauthorizedBehavior

### Community 87 - "Community 87"
Cohesion: 0.33
Nodes (4): curriculum, methodology, philosophy, PRE_PRIMARY_FAQS

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (3): highlights, leftItems, rightItems

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (3): avgRating, Testimonial, testimonials

### Community 90 - "Community 90"
Cohesion: 0.33
Nodes (3): chooseFactors, School, schools

### Community 91 - "Community 91"
Cohesion: 0.47
Nodes (4): autoSeedBlogsIfEmpty(), seedLog(), SeedPost, storage

### Community 92 - "Community 92"
Cohesion: 0.47
Nodes (4): db, pool, main(), seedRows()

### Community 94 - "Community 94"
Cohesion: 0.40
Nodes (3): awards, leftColumn, rightColumn

### Community 95 - "Community 95"
Cohesion: 0.40
Nodes (3): exploreLinks, preschoolLinks, quickLinks

### Community 96 - "Community 96"
Cohesion: 0.50
Nodes (4): Particle, RAINBOW_COLORS, RainbowCursor(), randomColor()

### Community 97 - "Community 97"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 99 - "Community 99"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 101 - "Community 101"
Cohesion: 0.40
Nodes (4): BRAND_CATEGORIES, BRAND_PARTNERS, BrandCategory, BrandPartner

### Community 102 - "Community 102"
Cohesion: 0.40
Nodes (3): emptyForm, grades, timeSlots

### Community 103 - "Community 103"
Cohesion: 0.40
Nodes (3): contactDetails, purposes, timeSlots

### Community 104 - "Community 104"
Cohesion: 0.50
Nodes (4): badge(), committee, designationColors, SchoolManagingCommittee()

### Community 105 - "Community 105"
Cohesion: 0.40
Nodes (3): distances, faqs, highlights

### Community 106 - "Community 106"
Cohesion: 0.40
Nodes (3): distances, faqs, highlights

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (3): distances, faqs, highlights

### Community 114 - "Community 114"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 115 - "Community 115"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 117 - "Community 117"
Cohesion: 0.67
Nodes (3): Button, ButtonProps, buttonVariants

### Community 118 - "Community 118"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 119 - "Community 119"
Cohesion: 0.50
Nodes (3): ToggleGroup, ToggleGroupContext, ToggleGroupItem

### Community 121 - "Community 121"
Cohesion: 0.67
Nodes (3): AdminSubmissions(), getToken(), Submission

### Community 124 - "Community 124"
Cohesion: 0.67
Nodes (3): FriendshipQRCard(), getToken(), School

### Community 128 - "Community 128"
Cohesion: 0.67
Nodes (3): getToken(), QRCard(), Ra

### Community 132 - "Community 132"
Cohesion: 0.50
Nodes (3): CODE_OWNED_BLOG_SLUGS, CODE_OWNED_BLOGS, CodeOwnedBlog

## Knowledge Gaps
- **735 isolated node(s):** `BlogPost`, `BrochureRequest`, `CallbackRequest`, `CareerApplication`, `Event` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `registerRoutes()` connect `Community 11` to `Community 2`, `Community 40`, `Community 8`, `Community 13`, `Community 48`, `Community 83`, `Community 20`, `Community 29`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `DbStorage` connect `Community 3` to `Community 91`, `Community 4`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `IStorage` connect `Community 4` to `Community 3`, `Community 91`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `registerRoutes()` (e.g. with `requireAdmin()` and `requireAlliancesOrAdmin()`) actually correct?**
  _`registerRoutes()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BlogPost`, `BrochureRequest`, `CallbackRequest` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.013513513513513514 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._