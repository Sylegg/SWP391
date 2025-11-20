package com.lemon.supershop.swp391fa25evdm.feedback.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne
    @JoinColumn(name = "UserId")
    @JsonIgnore
    private User user;

    @Column(name = "Content", columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "Status", nullable = false, columnDefinition = "VARCHAR(20)")
    private String status;

    public Feedback() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
