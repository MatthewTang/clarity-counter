
;; Multiplayer counter contract

;; constants
;;

;; data maps and vars
;;
(define-map counters principal uint)

;; private functions
;;

;; public functions
;;
(define-read-only (get-count (who principal))
    (default-to u0 (map-get? counters who))

)

(define-public (count-up)
    (begin
        (ok (map-set counters tx-sender (+ (get-count tx-sender) u1)))
    )
)
