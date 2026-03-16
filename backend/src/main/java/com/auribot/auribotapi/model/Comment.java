package com.auribot.auribotapi.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String author;

	@Column(nullable = false, length = 5000)
	private String content;

	@Column(nullable = false)
	private Instant createdAt = Instant.now();

	protected Comment() {
		// JPA
	}

	public Comment(String author, String content) {
		this.author = author;
		this.content = content;
		this.createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getAuthor() {
		return author;
	}

	public String getContent() {
		return content;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
