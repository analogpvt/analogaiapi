package middleware

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"net/http"
	"one-api/common"
	"one-api/model"
	"strings"
)

func authHelper(c *gin.Context, minRole int) {
	session := sessions.Default(c)
	username := session.Get("username")
	role := session.Get("role")
	id := session.Get("id")
	status := session.Get("status")
	if username == nil {
		// Check access token
		accessToken := c.Request.Header.Get("Authorization")
		if accessToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Not authorized to perform this operation, not logged in and not provided access token",
			})
			c.Abort()
			return
		}
		user := model.ValidateAccessToken(accessToken)
		if user != nil && user.Username != "" {
			// Token is valid
			username = user.Username
			role = user.Role
			id = user.Id
			status = user.Status
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "Not authorized to perform this operation，access token 无效",
			})
			c.Abort()
			return
		}
	}
	if status.(int) == common.UserStatusDisabled {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "User has been banned",
		})
		c.Abort()
		return
	}
	if role.(int) < minRole {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "Not authorized for this operation, insufficient privileges",
		})
		c.Abort()
		return
	}
	c.Set("username", username)
	c.Set("role", role)
	c.Set("id", id)
	c.Next()
}

func UserAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleCommonUser)
	}
}

func AdminAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleAdminUser)
	}
}

func RootAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHelper(c, common.RoleRootUser)
	}
}

func TokenAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		key := c.Request.Header.Get("Authorization")
		key = strings.TrimPrefix(key, "Bearer ")
		key = strings.TrimPrefix(key, "sk-")
		parts := strings.Split(key, "-")
		key = parts[0]
		token, err := model.ValidateUserToken(key)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"error": gin.H{
					"message": err.Error(),
					"type":    "one_api_error",
				},
			})
			c.Abort()
			return
		}
		if !model.IsUserEnabled(token.UserId) {
			c.JSON(http.StatusOK, gin.H{
				"error": gin.H{
					"message": "User has been banned",
					"type":    "one_api_error",
				},
			})
			c.Abort()
			return
		}
		c.Set("id", token.UserId)
		c.Set("token_id", token.Id)
		requestURL := c.Request.URL.String()
		consumeQuota := true
		if strings.HasPrefix(requestURL, "/v1/models") {
			consumeQuota = false
		}
		c.Set("consume_quota", consumeQuota)
		if len(parts) > 1 {
			if model.IsAdmin(token.UserId) {
				c.Set("channelId", parts[1])
			} else {
				c.JSON(http.StatusOK, gin.H{
					"error": gin.H{
						"message": "Ordinary users do not support specified channels",
						"type":    "one_api_error",
					},
				})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
