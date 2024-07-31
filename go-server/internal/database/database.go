package database

import (
	"context"
	// "database/sql"
	"fmt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
	"log"
	"os"
	"time"
)

type Service interface {
	Health() map[string]string
	CreateUser(
		ctx context.Context,
		googleID string,
		email string,
		picture string,
	) error
	GetUserByID(user_id uint32) (User, error)
	GetUserByEmail(email string) (User, error)
	InsertTask(
		user_id uint32,
		title string,
		description string,
		due time.Time,
		delegate bool,
		important bool,
	) error
	GetTaskByID(user_id uint32, task_id uuid.UUID) (Task, error)
	GetTasksByUserID(user_id uint32) ([]Task, error)
	DeleteTask(user_id uint32, task_id uuid.UUID) error
	DeleteUser(user_id uint32) error
}

type service struct {
	dbpool *pgxpool.Pool
}

func New() Service {
	// Load environment variables
	database := os.Getenv("DB_DATABASE")
	password := os.Getenv("DB_PASSWORD")
	username := os.Getenv("DB_USERNAME")
	port := os.Getenv("DB_PORT")
	host := os.Getenv("DB_HOST")

	connStr := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		username,
		password,
		host,
		port,
		database,
	)
	dbpool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatal(err)
	}

	s := &service{dbpool: dbpool}
	return s
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err := s.dbpool.Ping(ctx)
	if err != nil {
		log.Fatalf(fmt.Sprintf("db down: %v", err))
	}

	return map[string]string{
		"message": "It's healthy",
	}
}
