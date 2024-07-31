package database

import (
	"context"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Insert a user into the database
// If a user with the same email already exists, then do nothing
func (s *service) CreateUser(
	ctx context.Context,
	googleID string,
	email string,
	picture string,
) error {
	t := time.Now()
	validEmail, err := regexp.Match(`[_a-zA-Z0-9]+@.*\..*`, []byte(email))
	if err != nil {
		return err
	}
	if !validEmail {
		log.Printf("Failed to parse email address: %s", email)
	}
	name := strings.Split(email, "@")[0]
	query := `INSERT INTO users ("user_id", "google_id", "name", "email", "picture", "created", "updated") VALUES (DEFAULT, $1, $2, $3, $4, $5, $5) ON CONFLICT (google_id) DO UPDATE SET email = $3, picture = $4, updated = $5`
	_, err = s.dbpool.Exec(
		ctx,
		query,
		googleID,
		name,
		email,
		picture,
		t,
	)
	return err
}

// Gets a user from the database by their id
func (s *service) GetUserByID(id uint32) (User, error) {
	ctx := context.TODO()
	query := `SELECT * FROM users WHERE user_id = $1`
	row := s.dbpool.QueryRow(
		ctx,
		query,
		id,
	)
	user := new(User)
	err := row.Scan(
		&user.UserID,
		&user.GoogleID,
		&user.Name,
		&user.Email,
		&user.Picture,
		&user.Created,
		&user.Updated,
	)
	if err != nil {
		return *user, err
	}

	return *user, nil
}

// Gets a user from the database by their email
func (s *service) GetUserByEmail(email string) (User, error) {
	ctx := context.TODO()
	query := `SELECT * FROM users WHERE email = $1`
	row := s.dbpool.QueryRow(
		ctx,
		query,
		email,
	)
	user := new(User)
	err := row.Scan(
		&user.UserID,
		&user.GoogleID,
		&user.Name,
		&user.Email,
		&user.Picture,
		&user.Created,
		&user.Updated,
	)
	if err != nil {
		return *user, err
	}

	return *user, nil
}

// Inserts a task into the database
func (s *service) InsertTask(
	user_id uint32,
	title string,
	description string,
	due time.Time,
	delegate bool,
	important bool,
) error {
	t := time.Now()
	ctx := context.TODO()
	query := `INSERT INTO tasks (task_id, user_id, title, description, due, delegate, important, created, updated) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $7) ON CONFLICT (task_id) DO UPDATE SET title = $2, description = $3, due = $4, delegate = $5, important = $6, updated = $7`
	_, err := s.dbpool.Exec(
		ctx,
		query,
		user_id,
		title,
		description,
		due,
		delegate,
		important,
		t,
	)
	return err
}

// Get a task by its id
func (s *service) GetTaskByID(user_id uint32, task_id uuid.UUID) (Task, error) {
	ctx := context.TODO()
	query := `SELECT * FROM tasks WHERE user_id = $1 AND task_id = $2`
	row := s.dbpool.QueryRow(ctx, query, user_id, task_id)
	task := new(Task)
	err := row.Scan(
		&task.TaskID,
		&task.UserID,
		&task.Title,
		&task.Description,
		&task.Due,
		&task.Delegate,
		&task.Important,
		&task.Created,
		&task.Updated,
	)
	if err != nil {
		return *task, err
	}

	return *task, nil
}

// Get all of a users tasks
func (s *service) GetTasksByUserID(user_id uint32) ([]Task, error) {
	ctx := context.TODO()
	rows, err := s.dbpool.Query(ctx, `SELECT * FROM tasks WHERE user_id = $1`, user_id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	var tasks []Task
	for rows.Next() {
		var task Task
		err = rows.Scan(
			&task.TaskID,
			&task.UserID,
			&task.Title,
			&task.Description,
			&task.Due,
			&task.Delegate,
			&task.Important,
			&task.Created,
			&task.Updated,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (s *service) DeleteTask(user_id uint32, task_id uuid.UUID) error {
	ctx := context.TODO()
	query := `DELETE FROM tasks WHERE user_id = $1 AND task_id = $2`
	_, err := s.dbpool.Exec(ctx, query, user_id, task_id)
	return err
}

func (s *service) DeleteUser(user_id uint32) error {
	ctx := context.TODO()
	query := `DELETE FROM tasks WHERE user_id = $1`
	_, err := s.dbpool.Exec(ctx, query, user_id)
	if err != nil {
		return err
	}
	query = `DELETE FROM users WHERE user_id = $1`
	_, err = s.dbpool.Exec(ctx, query, user_id)
	return err
}
