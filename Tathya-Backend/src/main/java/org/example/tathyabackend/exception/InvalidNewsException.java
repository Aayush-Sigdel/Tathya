package org.example.tathyabackend.exception;

public class InvalidNewsException extends RuntimeException {
    public InvalidNewsException(String message) {
        super(message);
    }
}
