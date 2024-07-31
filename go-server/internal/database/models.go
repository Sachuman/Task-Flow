package database

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Represents a user
type User struct {
	UserID   uint32    `json:"user_id"`   // Unique identifier
	GoogleID string    `json:"google_id"` // ID provided by Google
	Name     string    `json:"username"`  // Username
	Email    string    `json:"email"`     // Email address
	Picture  string    `json:"picture"`   // Picture provided by Google
	Created  time.Time `json:"createdAt"` // Time of account creation
	Updated  time.Time `json:"updatedAt"` // Time of last modification to account information
	Tasks    []Task    `json:"tasks"`     // Slice containing all of the user's tasks
	// Tags    []string  `json:"tags"`      // Slice of tags for organization purposes
}

// Represents a task
type Task struct {
	TaskID      uuid.UUID `json:"task_id"`     // Unique identifier
	UserID      uint32    `json:"user_id"`     // The user id of the owner of the task
	Title       string    `json:"title"`       // Title of the task
	Description string    `json:"description"` // Task description
	// Tags        []string  `json:"tags"`        // Slice of tags for organization purposes
	Due       time.Time `json:"due"`       // Time that the task is due
	Delegate  bool      `json:"delegate"`  // Whether or not the task can be delegated
	Important bool      `json:"important"` // Is the task important?
	Active    bool      `json:"active"`    // Is the task currently active?
	Created   time.Time `json:"createdAt"` // Time of account creation
	Updated   time.Time `json:"updatedAt"` // Time of last modification to account information
}

// custom MarshalJSON function to handle UUID type
func (t *Task) MarshalJSON() ([]byte, error) {
	type Alias Task
	return json.Marshal(&struct {
		TaskID string `json:"task_id"`
		*Alias
	}{
		TaskID: t.TaskID.String(),
		Alias:  (*Alias)(t),
	})
}

// custom UnmarshalJSON function to handle UUID type
func (t *Task) UnmarshalJSON(data []byte) error {
	type Alias Task
	aux := &struct {
		TaskID string `json:"task_id"`
		Alias
	}{
		Alias: (Alias)(*t),
	}
	err := json.Unmarshal(data, &aux)
	if err != nil {
		return err
	}

	t.TaskID, err = uuid.Parse(aux.TaskID)
	if err != nil {
		return err
	}

	*t = Task(aux.Alias)

	return nil
}
