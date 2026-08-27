package oauth

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGoogleProvider_Metadata(t *testing.T) {
	p := &GoogleProvider{}

	assert.Equal(t, "Google", p.GetName())
	assert.Equal(t, "google_", p.GetProviderPrefix())
	assert.Equal(t, "google_id", p.ProviderUserIDColumn())

	common.GoogleOAuthEnabled = false
	assert.False(t, p.IsEnabled())

	common.GoogleOAuthEnabled = true
	assert.True(t, p.IsEnabled())
}

func TestGoogleProvider_Registry(t *testing.T) {
	provider := GetProvider("google")
	require.NotNil(t, provider)
	assert.Equal(t, "Google", provider.GetName())
}

func TestGoogleProvider_SetProviderUserID(t *testing.T) {
	p := &GoogleProvider{}
	u := &model.User{}

	p.SetProviderUserID(u, "google-sub-123456")
	assert.Equal(t, "google-sub-123456", u.GoogleId)
}
