# Customer Portal Redesign - Internal FAQ

**CONFIDENTIAL - Authenticated Users Only**

## Project Overview

The customer portal redesign project aims to modernize our 8-9 year old portal system by incorporating Agentix agents for improved functionality and user experience.

## Agentic-Enabled Portal Features

### Natural Language Query Capabilities
- Answer natural language questions about each division globally
- Drill down into specific divisions for detailed information
- Provide general information about company facilities and employment opportunities
- Access customer-specific information through APIs (Phase 2)

### Multi-Phase Development Approach

#### Phase 1: General FAQ Portal
- Develop general FAQ functionality
- Store information in SharePoint
- Support multiple languages (Spanish, English, Chinese)
- Basic question routing to ticketing systems

#### Phase 2: Customer-Specific Features
- API integration for customer-specific data access
- Multi-factor authentication (MFA) for deeper account inquiries
- Order tracking capabilities
- Customer authentication via email-based MFA

#### Phase 3: Strategic Client Features
- Live chat functionality for strategic clients
- Advanced customer support capabilities

## HR Bot Integration

The HR bot leverages AI capabilities to:
- Reference materials and files stored in SharePoint
- Answer HR-related questions
- Provide automated support for common HR inquiries

## Security and Authentication

### Multi-Factor Authentication (MFA)
- Required for deeper account inquiries and order tracking
- Email-based authentication system for customers
- Azure cloud-based MFA for internal users
- Integration options with Azure AD or AWS directory services
- Federation system compatibility

### Data Access Security
- Secure access to company data stored in AWS
- API-based data retrieval with proper authentication
- Controlled access to sensitive customer information

## Technical Implementation

### Data Sources
- **Phase 1**: SharePoint data integration
- **Phase 2**: AWS data access via secure APIs
- **Phase 3**: Real-time data integration

### API Development
- STS responsible for building necessary APIs
- Ryan's team playing significant role in development
- Dependency on AWS data transition completion

### Platform Integration
- Integration with corporate WordPress website
- Mobile and desktop device support
- Neutral point-of-use design

### Ticketing System Integration
- Zendesk ticket routing for unsupported questions
- Division-specific ticketing system integration
- Email routing for complex inquiries

## Project Timeline and Delivery

### Expected Timeline
- Project start: Q4 current year or Q1 next year
- Phased delivery approach
- Potential combination of Phase 1 and Phase 2 depending on AWS migration

### Pricing Structure
- Fixed bid pricing model
- Competitive proposals from engineering teams

## Components Division Integration

### Product Data Handling
- Vectorization of product data for LLM understanding
- Search capabilities for parts (seat belts, seats, etc.)
- Product catalog integration
- External website access consideration

### Data Collection Strategy
- Data scraping processes for product information
- AI training with comprehensive product data
- Automated data updates and maintenance

## Support and Maintenance

### Support Structure
- Victor from SDS provides components system support
- Engineering team proposal development
- Administrative oversight coordination

### System Intelligence
- Mechanism to identify knowledge gaps
- Automatic ticket creation for unknown queries
- Email routing for complex issues

## Strategic Considerations

### Portfolio Development
- Opportunity to build strong portfolio with project work
- Client acquisition strategy through successful implementation
- Demonstration of capabilities to attract future clients

### Proof of Concept
- Defined scope for initial demonstration
- Product capability showcase
- Client requirement validation

## Follow-up Actions

1. Engineering team proposal development and submission
2. Administrative project discussion coordination
3. Effort and cost analysis for next phase planning
4. Client discussion regarding product catalog criticality
5. External website access requirement clarification

---
*This document contains confidential information about internal project planning and should only be accessed by authenticated personnel.*
