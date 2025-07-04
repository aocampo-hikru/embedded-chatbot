# Customer Portal Redesign - Project FAQ

## Project Overview

### What is the Customer Portal Redesign project?
The Customer Portal Redesign is a comprehensive initiative to modernize our 8-9 year old customer portal by incorporating Agentix agents for improved functionality and user experience.

### What are the main goals of this project?
- Create an agentic-enabled portal that can answer natural language questions
- Provide global division information with drill-down capabilities
- Implement multi-factor authentication for enhanced security
- Support multiple languages (Spanish, English, Chinese)
- Integrate with existing systems and data sources

## Project Phases

### Phase One
- **Scope**: General FAQ portal development
- **Data Source**: SharePoint stored information
- **Features**: 
  - General company information (facilities, employment opportunities, divisions)
  - Multi-language support from day one
  - Basic ticketing system integration for unsupported questions

### Phase Two
- **Scope**: Component-specific questions and customer authentication
- **Data Source**: AWS data accessed via APIs
- **Features**:
  - Customer-specific information access
  - Multi-factor authentication process based on customer email
  - Integration with customer databases

### Phase Three
- **Scope**: Live chat functionality for strategic clients
- **Features**: Real-time support for high-value customers

## Technical Implementation

### Authentication and Security
- **MFA Process**: Multi-factor authentication for deeper account inquiries and order tracking
- **Internal Users**: Authentication through Azure cloud
- **Customer Authentication**: Email-based MFA system in phase two
- **Directory Integration**: Azure or AWS directory integration with Federation system support

### Data Access and Integration
- **Phase One**: SharePoint data access
- **Phase Two**: AWS data access via custom APIs built by STS team
- **API Development**: STS responsible for building necessary APIs with Ryan's team playing significant role
- **Ticketing Integration**: Unanswered questions routed to Zendesk or division-specific systems

### Platform and Technology
- **Website Integration**: Agent embedded within corporate WordPress website
- **Mobile Support**: Neutral design supporting both mobile and desktop devices
- **Configuration**: Administrative configuration screen for parameter management
- **Product Data**: Vectorized product data for LLM understanding and search capabilities

## HR Bot Integration

### Features
- AI-enabled HR bot with SharePoint integration
- Access to HR materials and files stored in SharePoint
- Natural language query processing for HR-related questions

### Use Cases
- Employee handbook queries
- Policy and procedure questions
- Benefits information requests
- Internal process guidance

## Components Division Support

### Overview
The components division handles critical automotive parts including:
- Seat belts
- Seats
- Safety components
- Interior elements

### Technical Requirements
- Product catalog vectorization for LLM integration
- External website access capabilities (if required)
- Data scraping processes for product information collection
- Support integration with Victor from SDS for components system

## Project Timeline and Strategy

### Timeline
- **Expected Start**: Q4 this year or Q1 next year
- **Dependencies**: Data transition to AWS completion required for phase two

### Business Strategy
- Fixed bid pricing model confirmed
- Portfolio building opportunity for future client acquisition
- Strong demonstration capabilities for business development

### Quality Assurance
- Mechanism to identify system knowledge limitations
- Automatic ticket creation for unknown queries
- Fallback email routing for complex issues

## Configuration and Administration

### Administrative Features
- Parameter configuration screens
- Access level management
- Content update workflows
- Performance monitoring and analytics

### Support Structure
- Victor from SDS provides components system support
- Engineering team proposal development and delivery
- Regular administrative review meetings with Pablo

## Success Metrics

### Technical Metrics
- Query resolution accuracy
- Response time performance
- User authentication success rates
- System uptime and reliability

### Business Metrics
- Customer satisfaction scores
- Support ticket reduction
- User adoption rates
- Cost savings from automation

## Contact Information

**Project Lead**: Shane  
**Technical Lead**: Ryan's Team  
**Components Support**: Victor (SDS)  
**Administrative Contact**: Pablo

---

*This document contains confidential project information and is restricted to authorized personnel only.*
