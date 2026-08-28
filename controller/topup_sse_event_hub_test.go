package controller

import (
	"sync"
	"testing"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPaymentEventHub_SubscribeAndBroadcast(t *testing.T) {
	tradeNo := "KCTEST_SSE_001"

	ch, unsubscribe := SubscribePaymentEvent(tradeNo)
	defer unsubscribe()

	eventToSend := PaymentStatusEvent{
		TradeNo: tradeNo,
		Status:  common.TopUpStatusSuccess,
		Amount:  10,
		Money:   250000,
	}

	BroadcastPaymentEvent(eventToSend)

	select {
	case received := <-ch:
		assert.Equal(t, tradeNo, received.TradeNo)
		assert.Equal(t, common.TopUpStatusSuccess, received.Status)
		assert.Equal(t, int64(10), received.Amount)
		assert.Equal(t, 250000.0, received.Money)
	case <-time.After(1 * time.Second):
		t.Fatal("Timeout waiting for payment event")
	}
}

func TestPaymentEventHub_MultipleSubscribers(t *testing.T) {
	tradeNo := "KCTEST_SSE_MULTI"

	ch1, unsub1 := SubscribePaymentEvent(tradeNo)
	defer unsub1()

	ch2, unsub2 := SubscribePaymentEvent(tradeNo)
	defer unsub2()

	eventToSend := PaymentStatusEvent{
		TradeNo: tradeNo,
		Status:  common.TopUpStatusExpired,
		Amount:  5,
		Money:   125000,
	}

	BroadcastPaymentEvent(eventToSend)

	// Verify both channels received the broadcast
	select {
	case rec1 := <-ch1:
		assert.Equal(t, common.TopUpStatusExpired, rec1.Status)
	case <-time.After(1 * time.Second):
		t.Fatal("Timeout on subscriber 1")
	}

	select {
	case rec2 := <-ch2:
		assert.Equal(t, common.TopUpStatusExpired, rec2.Status)
	case <-time.After(1 * time.Second):
		t.Fatal("Timeout on subscriber 2")
	}
}

func TestPaymentEventHub_UnsubscribeCleanup(t *testing.T) {
	tradeNo := "KCTEST_SSE_CLEANUP"

	ch, unsubscribe := SubscribePaymentEvent(tradeNo)

	paymentEventSubscribersMu.RLock()
	subsBefore := len(paymentEventSubscribers[tradeNo])
	paymentEventSubscribersMu.RUnlock()
	require.Equal(t, 1, subsBefore)

	unsubscribe()

	paymentEventSubscribersMu.RLock()
	_, exists := paymentEventSubscribers[tradeNo]
	paymentEventSubscribersMu.RUnlock()
	assert.False(t, exists, "Expected tradeNo entry to be deleted when all subscribers unsubscribe")

	// Channel should not receive new events after unsubscribe
	BroadcastPaymentEvent(PaymentStatusEvent{TradeNo: tradeNo, Status: common.TopUpStatusSuccess})
	select {
	case <-ch:
		t.Fatal("Unsubscribed channel should not receive events")
	case <-time.After(50 * time.Millisecond):
		// Expected
	}
}

func TestPaymentEventHub_ConcurrentAccess(t *testing.T) {
	tradeNo := "KCTEST_SSE_CONCURRENT"
	var wg sync.WaitGroup

	numSubscribers := 20
	unsubFuncs := make([]func(), numSubscribers)

	for i := 0; i < numSubscribers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			ch, unsub := SubscribePaymentEvent(tradeNo)
			unsubFuncs[idx] = unsub

			go func() {
				select {
				case <-ch:
				case <-time.After(2 * time.Second):
				}
			}()
		}(i)
	}

	wg.Wait()

	// Concurrent Broadcast
	for b := 0; b < 5; b++ {
		go BroadcastPaymentEvent(PaymentStatusEvent{
			TradeNo: tradeNo,
			Status:  common.TopUpStatusSuccess,
		})
	}

	time.Sleep(100 * time.Millisecond)

	for _, unsub := range unsubFuncs {
		if unsub != nil {
			unsub()
		}
	}

	paymentEventSubscribersMu.RLock()
	_, exists := paymentEventSubscribers[tradeNo]
	paymentEventSubscribersMu.RUnlock()
	assert.False(t, exists)
}
