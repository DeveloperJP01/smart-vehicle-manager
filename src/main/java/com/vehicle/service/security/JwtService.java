package com.vehicle.service.security;
import io.jsonwebtoken.Jwts; import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey; import java.util.Date;
@Service
public class JwtService {
    private static final String SECRET_KEY = "YourSuperSecretKeyForVehicleManagementSystem!";
    private SecretKey getSigningKey() { return Keys.hmacShaKeyFor(SECRET_KEY.getBytes()); }
    public String generateToken(String username) { return Jwts.builder().subject(username).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 86400000)).signWith(getSigningKey()).compact(); }
    public String extractUsername(String token) { return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject(); }
    public boolean isTokenValid(String token, String username) { return (username.equals(extractUsername(token)) && !isTokenExpired(token)); }
    private boolean isTokenExpired(String token) { return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date()); }
}
