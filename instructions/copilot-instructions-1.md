# GitHub Copilot Custom Instructions: Spring Boot Hackathon API

## Project Standards and Architecture
- **Language**: Java 21.
- **Framework**: Spring Boot 3.x using the `org.springframework.boot` stack.
- **Database**: MS SQL Server (SQL). Use snake_case for database tables and columns.
- **Security**: Spring Security 6.x with JWT stateless authentication.
- **API Style**: RESTful JSON APIs with standard HTTP response codes.
- **Validation**: Use Jakarta Validation (`jakarta.validation.constraints`) in DTOs.
- **ORM modeling**: Use code-first (Hibernate/JPA).
- **APIs document**: Use Swagger UI (springdoc-openapi).

## Security & Authentication Rules
- **Configuration**: Use `@EnableWebSecurity` with a `SecurityFilterChain` bean.
- **Stateless**: Configure session management to `SessionCreationPolicy.STATELESS`.
- **JWT Filter**: Intercept requests using a custom `OncePerRequestFilter` to validate JWTs from the `Authorization: Bearer <token>` header.
- **Role-Based Access**:
  - `GET /api/v1/auth/**`, `GET /api/v1/public/**`: Permit all (public).
  - `POST`, `PUT`, `DELETE /api/v1/admin/**`: Require `ROLE_ADMIN`.
  - `POST`, `PUT`, `DELETE /api/v1/organizer/**`: Require `ROLE_ORGANIZER`.
  - Other endpoints require authentication.

## Domain: Hackathon System
Adhere strictly to the following layered architecture when generating code for domains (e.g., `User`, `HackathonEvent`, `Team`, `Submission`):

### 1. Database Entity (e.g., `HackathonEvent`)
- Package: `com.example.hackathon.entity` (or your specific root package).
- Annotations: `@Entity`, `@Table(name = "table_name")`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`. 
- Note: Avoid using `@Data` on JPA Entities to prevent infinite recursion in relationships; use `@Getter` and `@Setter` instead.
- Field types matching MS SQL: Use `Long` for BIGINT identity, `String` for NVARCHAR/VARCHAR, `Boolean` for BIT, and `LocalDateTime` for DATETIME2.

### 2. DTOs & Mappers
- Package DTOs: `com.example.hackathon.dto.request` and `com.example.hackathon.dto.response`.
- Naming convention: `<Entity>RequestDto` and `<Entity>ResponseDto`.
- Mapper: MapStruct interface `<Entity>Mapper` with `componentModel = "spring"`.

### 3. Service & Controller
- Repository: `<Entity>Repository` extending `JpaRepository`.
- Service: `<Entity>Service` interface and `<Entity>ServiceImpl` implementation.
- Controller: `<Entity>Controller` mapped at `/api/v1/<entities>`. Use `@PreAuthorize` for specific role access controls.

## Coding & Style Guidelines
- **Dependency Injection**: Use Constructor Injection via Lombok's `@RequiredArgsConstructor` (avoid `@Autowired` on fields).
- **Lombok**: Use `@Builder`, `@Getter`, `@Setter`, and `@RequiredArgsConstructor`.
- **Exceptions**: Wrap entity-not-found exceptions in a custom `ResourceNotFoundException`. Use a Global Exception Handler (`@RestControllerAdvice`) to return standardized error JSONs.
