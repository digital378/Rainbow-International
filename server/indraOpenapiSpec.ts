/**
 * Importable OpenAPI contract for Indra Intelligence.
 *
 * This is intentionally separate from the legacy public marketing schema.
 * It describes only the read-only, bearer-protected /api/indra/v1 bridge.
 * The live /catalog response remains the source of truth for current
 * resources and routing guidance after the client has imported this schema.
 */
export const INDRA_OPENAPI_YAML = `openapi: 3.1.0
info:
  title: Rainbow International School — Indra Data Bridge
  version: 1.0.0
  description: |
    Broad, read-only operational data bridge for Indra Intelligence.

    Import this schema to discover the protected Rainbow API. Configure the
    dedicated INDRA_API_TOKEN in the importing client's secure credential
    store; never paste a token into this document, chat, source code, or logs.

    Read /api/indra/v1/catalog before answering a new class of question.
    For admissions and dashboard totals, use the aggregate endpoints rather
    than counting a paginated /crm/leads response.
servers:
  - url: https://rainbowinternationalschool.in
    description: Production Rainbow International School API
security:
  - IndraBearer: []
  - IndraApiKey: []
tags:
  - name: Discovery
  - name: CRM
  - name: Dashboard
  - name: Website
  - name: Friendship Schools
  - name: Content
  - name: Public Site
  - name: Repository
components:
  securitySchemes:
    IndraBearer:
      type: http
      scheme: bearer
      bearerFormat: opaque
      description: Dedicated INDRA_API_TOKEN sent as Authorization: Bearer <token>.
    IndraApiKey:
      type: apiKey
      in: header
      name: X-Indra-Api-Key
      description: Alternative header for the dedicated INDRA_API_TOKEN.
  parameters:
    AcademicYear:
      name: academicYear
      in: query
      required: true
      description: Academic year in YYYY-YY form, for example 2027-28.
      schema:
        type: string
        pattern: '^\\\\d{4}-\\\\d{2}$'
        example: 2027-28
    OptionalAcademicYear:
      name: academicYear
      in: query
      required: false
      description: Academic year in YYYY-YY form.
      schema:
        type: string
        pattern: '^\\\\d{4}-\\\\d{2}$'
    HistoricalAcademicYear:
      name: academicYear
      in: query
      required: true
      description: Academic year in YYYY-YY form, or all to return each known academic-year provider.
      schema:
        type: string
        pattern: '^(\\\\d{4}-\\\\d{2}|all)$'
    Brand:
      name: brand
      in: query
      required: false
      schema:
        type: string
        enum: [RIS, RPS]
    AdmissionsBrand:
      name: brand
      in: query
      required: false
      description: Defaults to BOTH.
      schema:
        type: string
        enum: [RIS, RPS, BOTH]
        default: BOTH
    BranchId:
      name: branchId
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
    Page:
      name: page
      in: query
      required: false
      schema:
        type: integer
        minimum: 1
        default: 1
    PageSize:
      name: pageSize
      in: query
      required: false
      description: Maximum is 200.
      schema:
        type: integer
        minimum: 1
        maximum: 200
        default: 100
    CreatedSince:
      name: createdSince
      in: query
      required: false
      description: ISO 8601 timestamp; returns records created on or after this time.
      schema:
        type: string
        format: date-time
    PublishedSince:
      name: publishedSince
      in: query
      required: false
      description: ISO 8601 timestamp; returns content published on or after this time.
      schema:
        type: string
        format: date-time
  schemas:
    Envelope:
      type: object
      required: [ok, apiVersion, source, dataset, generatedAt, data]
      properties:
        ok:
          type: boolean
          example: true
        apiVersion:
          type: string
          example: v1
        source:
          type: string
          example: rainbow-international-school
        dataset:
          type: string
        generatedAt:
          type: string
          format: date-time
        page:
          type: integer
        pageSize:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        data:
          type: object
          additionalProperties: true
    Error:
      type: object
      required: [message]
      properties:
        message:
          type: string
  responses:
    Success:
      description: Successful read-only response envelope.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Envelope'
    InvalidRequest:
      description: Invalid filter or parameter.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Missing or invalid Indra credential.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
paths:
  /api/indra/v1:
    get:
      tags: [Discovery]
      operationId: getIndraCatalogFromBase
      summary: Read the Indra resource catalog from the base URL
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/catalog:
    get:
      tags: [Discovery]
      operationId: getIndraCatalog
      summary: Read datasets, routing guidance, source metadata, and exclusions
      description: Call this before selecting an endpoint for a new question type.
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/health:
    get:
      tags: [Discovery]
      operationId: getIndraHealth
      summary: Read credential and outbound-delivery status
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/crm/leads:
    get:
      tags: [CRM]
      operationId: listCrmLeads
      summary: Read paginated operational CRM lead records
      description: |
        May contain approved operational contact data. Never use a single page
        as a total for admissions or dashboard questions.
      parameters:
        - $ref: '#/components/parameters/Brand'
        - $ref: '#/components/parameters/OptionalAcademicYear'
        - $ref: '#/components/parameters/BranchId'
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
        - name: updatedSince
          in: query
          schema: { type: string, format: date-time }
        - name: includeArchived
          in: query
          schema: { type: boolean, default: false }
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/crm/reference:
    get:
      tags: [CRM]
      operationId: getCrmReference
      summary: Read CRM branches, staff, and active lookup values
      description: This response includes staff names and must be handled as private operational data.
      parameters:
        - $ref: '#/components/parameters/Brand'
        - name: includeInactive
          in: query
          schema: { type: boolean, default: false }
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/crm/summary:
    get:
      tags: [CRM]
      operationId: getCrmSummary
      summary: Read aggregate CRM totals by brand, status, and source
      parameters:
        - $ref: '#/components/parameters/Brand'
        - $ref: '#/components/parameters/OptionalAcademicYear'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/crm/admissions:
    get:
      tags: [CRM]
      operationId: getAdmissionsKpis
      summary: Read verified admissions KPIs by academic year
      description: |
        Uses non-archived CRM records. An admission is a lead whose normalized
        status is exactly ADMISSION DONE.
      parameters:
        - $ref: '#/components/parameters/AcademicYear'
        - $ref: '#/components/parameters/AdmissionsBrand'
        - $ref: '#/components/parameters/BranchId'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/crm/admissions-performance:
    get:
      tags: [Dashboard]
      operationId: getAdmissionsPerformance
      summary: Read live admissions conversion metrics by brand
      description: Do not substitute raw lead pages for this aggregate.
      parameters:
        - $ref: '#/components/parameters/AcademicYear'
        - $ref: '#/components/parameters/Brand'
        - $ref: '#/components/parameters/BranchId'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/dashboard/overview:
    get:
      tags: [Dashboard]
      operationId: getDashboardOverview
      summary: Read a combined live Rainbow operational overview
      description: |
        academicYear, brand, and branchId filter only the nested admissions
        section. Website demand, Friendship School, content, and public-site
        sections are all-time, organisation-wide values.
      parameters:
        - $ref: '#/components/parameters/AcademicYear'
        - $ref: '#/components/parameters/Brand'
        - $ref: '#/components/parameters/BranchId'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/dashboard/academic-years:
    get:
      tags: [Dashboard]
      operationId: listHistoricalAcademicYears
      summary: Discover academic-year dashboard providers and coverage
      description: Returns provider availability and limitations before reading historical aggregate reports.
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/dashboard/reports:
    get:
      tags: [Dashboard]
      operationId: getHistoricalDashboardReports
      summary: Read aggregate-only historical dashboard reports
      description: |
        Use academicYear=2026-27 for the legacy Marketing, RIS Sales, and RPS
        Sales providers. Use all to return every provider with its provenance and
        limitation. Do not combine provider totals unless their definitions match.
      parameters:
        - $ref: '#/components/parameters/HistoricalAcademicYear'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/website/{dataset}:
    get:
      tags: [Website]
      operationId: listWebsiteRecords
      summary: Read paginated website demand records
      parameters:
        - name: dataset
          in: path
          required: true
          schema:
            type: string
            enum: [inquiries, callback-requests, brochure-requests, career-applications]
        - $ref: '#/components/parameters/CreatedSince'
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/friendship/{dataset}:
    get:
      tags: [Friendship Schools]
      operationId: listFriendshipRecords
      summary: Read Friendship School profiles or lead records
      parameters:
        - name: dataset
          in: path
          required: true
          schema:
            type: string
            enum: [schools, leads]
        - $ref: '#/components/parameters/CreatedSince'
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/content/blogs:
    get:
      tags: [Content]
      operationId: listBlogContent
      summary: Read database-backed and code-owned blog content
      parameters:
        - $ref: '#/components/parameters/PublishedSince'
        - $ref: '#/components/parameters/Page'
        - $ref: '#/components/parameters/PageSize'
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '400': { $ref: '#/components/responses/InvalidRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/site/pages:
    get:
      tags: [Public Site]
      operationId: listPublicSitePages
      summary: Read canonical Rainbow public-page metadata
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /api/indra/v1/repository/context:
    get:
      tags: [Repository]
      operationId: getRepositoryContext
      summary: Read the official repository and GitHub connector boundary
      description: Use the separate read-only GitHub connector for files, commits, issues, and pull requests.
      responses:
        '200': { $ref: '#/components/responses/Success' }
        '401': { $ref: '#/components/responses/Unauthorized' }
`;