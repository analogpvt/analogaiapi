package controller

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"one-api/common"
	"one-api/model"
	"strconv"
	"sync"
	"time"
)

func testChannel(channel *model.Channel, request *ChatRequest) error {
	if request.Model == "" {
		request.Model = "gpt-3.5-turbo"
		if channel.Type == common.ChannelTypeAzure {
			request.Model = "gpt-35-turbo"
		}
	}
	requestURL := common.ChannelBaseURLs[channel.Type]
	if channel.Type == common.ChannelTypeAzure {
		requestURL = fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=2023-03-15-preview", channel.BaseURL, request.Model)
	} else {
		if channel.Type == common.ChannelTypeCustom {
			requestURL = channel.BaseURL
		}
		requestURL += "/v1/chat/completions"
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", requestURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	if channel.Type == common.ChannelTypeAzure {
		req.Header.Set("api-key", channel.Key)
	} else {
		req.Header.Set("Authorization", "Bearer "+channel.Key)
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	var response TextResponse
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return err
	}
	if response.Error.Message != "" || response.Error.Code != "" {
		return errors.New(fmt.Sprintf("type %s, code %s, message %s", response.Error.Type, response.Error.Code, response.Error.Message))
	}
	return nil
}

func buildTestRequest(c *gin.Context) *ChatRequest {
	model_ := c.Query("model")
	testRequest := &ChatRequest{
		Model:     model_,
		MaxTokens: 1,
	}
	testMessage := Message{
		Role:    "user",
		Content: "hi",
	}
	testRequest.Messages = append(testRequest.Messages, testMessage)
	return testRequest
}

func TestChannel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel, err := model.GetChannelById(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	testRequest := buildTestRequest(c)
	tik := time.Now()
	err = testChannel(channel, testRequest)
	tok := time.Now()
	milliseconds := tok.Sub(tik).Milliseconds()
	go channel.UpdateResponseTime(milliseconds)
	consumedTime := float64(milliseconds) / 1000.0
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
			"time":    consumedTime,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"time":    consumedTime,
	})
	return
}

var testAllChannelsLock sync.Mutex
var testAllChannelsRunning bool = false

// disable & notify
func disableChannel(channelId int, channelName string, reason string) {
	if common.RootUserEmail == "" {
		common.RootUserEmail = model.GetRootUserEmail()
	}
	model.UpdateChannelStatusById(channelId, common.ChannelStatusDisabled)
	subject := fmt.Sprintf("aisle「%s」（#%d）disabled", channelName, channelId)
	content := fmt.Sprintf("aisle「%s」（#%d）disabled，reason：%s", channelName, channelId, reason)
	err := common.SendEmail(subject, common.RootUserEmail, content)
	if err != nil {
		common.SysError(fmt.Sprintf("Failed to send mail：%s", err.Error()))
	}
}

func testAllChannels(c *gin.Context) error {
	if common.RootUserEmail == "" {
		common.RootUserEmail = model.GetRootUserEmail()
	}
	testAllChannelsLock.Lock()
	if testAllChannelsRunning {
		testAllChannelsLock.Unlock()
		return errors.New("Test is already running")
	}
	testAllChannelsRunning = true
	testAllChannelsLock.Unlock()
	channels, err := model.GetAllChannels(0, 0, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return err
	}
	testRequest := buildTestRequest(c)
	var disableThreshold = int64(common.ChannelDisableThreshold * 1000)
	if disableThreshold == 0 {
		disableThreshold = 10000000 // a impossible value
	}
	go func() {
		for _, channel := range channels {
			if channel.Status != common.ChannelStatusEnabled {
				continue
			}
			tik := time.Now()
			err := testChannel(channel, testRequest)
			tok := time.Now()
			milliseconds := tok.Sub(tik).Milliseconds()
			if err != nil || milliseconds > disableThreshold {
				if milliseconds > disableThreshold {
					err = errors.New(fmt.Sprintf("Response time %.2fs Threshold exceeded %.2fs", float64(milliseconds)/1000.0, float64(disableThreshold)/1000.0))
				}
				disableChannel(channel.Id, channel.Name, err.Error())
			}
			channel.UpdateResponseTime(milliseconds)
		}
		err := common.SendEmail("Channel test complete", common.RootUserEmail, "Channel test complete，If you do not receive a disabling notification，Indicates that all channels are normal")
		if err != nil {
			common.SysError(fmt.Sprintf("Failed to send mail：%s", err.Error()))
		}
		testAllChannelsLock.Lock()
		testAllChannelsRunning = false
		testAllChannelsLock.Unlock()
	}()
	return nil
}

func TestAllChannels(c *gin.Context) {
	err := testAllChannels(c)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}
