package server

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/jwtauth/v5"
)

var tokenAuth *jwtauth.JWTAuth

func (s *Server) RegisterRoutes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	router.Get("/", s.HelloWorldHandler)
	router.Get("/health", s.healthHandler)

	tokenAuth = jwtauth.New("HS256", jwtKey, nil) // replace with secret key

	router.Group(func(router chi.Router) {
		// Seek, verify and validate JWT tokens
		router.Use(jwtauth.Verifier(tokenAuth))

		// Handle valid / invalid tokens
		router.Use(jwtauth.Authenticator(tokenAuth))

		router.Route("/users", s.userProtocol)
	})
	router.Route("/auth", s.authProtocol)

	return router
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(s.db.Health())
	_, _ = w.Write(jsonResp)
}

func (s *Server) userProtocol(router chi.Router) {
	router.Get("/{user_id}/tasks", s.List)
	router.Get("/{user_id}/tasks/{task_id}", s.GetTask)
	router.Post("/{user_id}/tasks/", s.Create)
	router.Put("/{user_id}/tasks/{task_id}", s.Update)
	router.Delete("/{user_id}/tasks/{task_id}", s.TaskDelete)
	router.Delete("/{user_id}", s.UserDelete)
}

func (s *Server) authProtocol(router chi.Router) {
	// Should not need to create account
	router.Get("/google/login", s.GoogleLoginHandler)
	router.Post("/google/callback", s.GoogleCallbackHandler)
}
